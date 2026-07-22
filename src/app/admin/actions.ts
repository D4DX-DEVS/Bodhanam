"use server";

import { verifyLogin, createSession, destroySession, getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sanitizeArticleHtml } from "@/lib/sanitize";

export async function loginAction(
  email: string,
  password: string
): Promise<{ error: string } | { error?: undefined }> {
  const user = await verifyLogin(email, password);
  if (!user) {
    return { error: "Invalid email or password" };
  }

  await createSession(user.id);
  return {};
}

export async function logoutAction() {
  await destroySession();
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<{ error: string } | { error?: undefined }> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: Number(session.userId) } });
  if (!user) throw new Error("Unauthorized");

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) {
    return { error: "Current password is incorrect" };
  }

  if (newPassword.length < 12) {
    return { error: "New password must be at least 12 characters" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  return {};
}

export async function createIssueAction(data: {
  volume: number | null;
  issueNo: number | null;
  period: string;
  description: string | null;
  coverImage: string | null;
  published: boolean;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Compute next id as max(existing) + 1
  const maxIssue = await db.issue.aggregate({
    _max: { id: true },
  });
  const nextId = (maxIssue._max.id ?? 0) + 1;

  const issue = await db.issue.create({
    data: {
      id: nextId,
      volume: data.volume,
      issueNo: data.issueNo,
      period: data.period,
      description: data.description,
      coverImage: data.coverImage,
      published: data.published,
    },
  });

  revalidatePath("/admin/issues");
  revalidatePath("/");
  return issue;
}

export async function updateIssueAction(
  id: number,
  data: {
    volume: number | null;
    issueNo: number | null;
    period: string;
    description: string | null;
    coverImage: string | null;
    published: boolean;
  }
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const issue = await db.issue.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/issues");
  revalidatePath(`/issue/${id}`);
  revalidatePath("/");
  return issue;
}

export async function deleteIssueAction(id: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await db.issue.delete({
    where: { id },
  });

  revalidatePath("/admin/issues");
  revalidatePath("/");
}

export async function createArticleAction(data: {
  title: string;
  author: string | null;
  category: string | null;
  excerpt: string | null;
  bodyHtml: string;
  coverImage: string | null;
  order: number;
  period: string | null;
  issueId: number;
  published: boolean;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const maxArticle = await db.article.aggregate({
    _max: { id: true },
  });
  const nextId = (maxArticle._max.id ?? 0) + 1;

  const article = await db.article.create({
    data: {
      id: nextId,
      ...data,
      bodyHtml: sanitizeArticleHtml(data.bodyHtml),
    },
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/issue/${data.issueId}`);
  revalidatePath(`/article/${nextId}`);
  revalidatePath("/");
  return article;
}

export async function updateArticleAction(
  id: number,
  data: {
    title: string;
    author: string | null;
    category: string | null;
    excerpt: string | null;
    bodyHtml: string;
    coverImage: string | null;
    order: number;
    period: string | null;
    issueId: number;
    published: boolean;
  }
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const oldArticle = await db.article.findUnique({
    where: { id },
  });

  const article = await db.article.update({
    where: { id },
    data: {
      ...data,
      bodyHtml: sanitizeArticleHtml(data.bodyHtml),
    },
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/issue/${oldArticle?.issueId}`);
  revalidatePath(`/issue/${data.issueId}`);
  revalidatePath(`/article/${id}`);
  revalidatePath("/");
  return article;
}

export async function setArticlePublishedAction(id: number, published: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const article = await db.article.update({
    where: { id },
    data: { published },
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/issue/${article.issueId}`);
  revalidatePath(`/articles/show/${id}`);
  revalidatePath("/");
  return article;
}

export async function deleteArticleAction(id: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const article = await db.article.findUnique({
    where: { id },
  });

  await db.article.delete({
    where: { id },
  });

  revalidatePath("/admin/articles");
  if (article) {
    revalidatePath(`/issue/${article.issueId}`);
  }
  revalidatePath("/");
}

export async function updatePageAction(
  slug: string,
  data: { title: string; bodyHtml: string }
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const sanitizedData = {
    ...data,
    bodyHtml: sanitizeArticleHtml(data.bodyHtml),
  };

  const page = await db.page.upsert({
    where: { slug },
    update: sanitizedData,
    create: { slug, ...sanitizedData },
  });

  revalidatePath("/admin/pages");
  revalidatePath(`/${slug}`);
  return page;
}

export async function updateSettingAction(
  key: string,
  value: string
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const setting = await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return setting;
}
