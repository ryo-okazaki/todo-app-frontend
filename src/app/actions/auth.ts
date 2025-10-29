'use server';

import { cookies } from "next/headers";
import { z } from 'zod';

// バリデーションスキーマ
const registerSchema = z.object({
  name: z.string().min(1, '名前を入力してください').max(50, '名前は50文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/[A-Za-z]/, 'パスワードには英字を含めてください')
    .regex(/[0-9]/, 'パスワードには数字を含めてください'),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'パスワードが一致しません',
  path: ['passwordConfirmation'],
});

export type RegisterFieldErrors = {
  name?: string[];
  email?: string[];
  password?: string[];
  passwordConfirmation?: string[];
};

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'メールアドレスとパスワードを入力してください' };
  }

  try {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://todo-express:3000';
    const response = await fetch(`${apiBaseUrl}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || 'ログインに失敗しました' };
    }

    const data = await response.json();

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'authToken',
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1日
      path: '/'
    });

    return { success: true, user: data.user };
  } catch (err) {
    console.error('Login error:', err);
    return { error: '認証サービスに接続できませんでした。後でやり直してください。' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('authToken');
  return { success: true };
}

export async function registerAction(formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const passwordConfirmation = formData.get('passwordConfirmation');

  // バリデーション
  const validationResult = registerSchema.safeParse({
    name,
    email,
    password,
    passwordConfirmation,
  });

  if (!validationResult.success) {
    const fieldErrors: RegisterFieldErrors = {};
    validationResult.error.errors.forEach((error) => {
      const field = error.path[0] as keyof RegisterFieldErrors;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field]!.push(error.message);
    });

    return {
      success: false,
      error: 'バリデーションエラーがあります',
      fieldErrors,
    };
  }

  try {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://todo-express:3000';
    // API呼び出し
    const response = await fetch(`${apiBaseUrl}/api/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: validationResult.data.name,
        email: validationResult.data.email,
        password: validationResult.data.password,
        password_confirmation: validationResult.data.passwordConfirmation,
      }),
    });

    console.log(`register success:`, response);
    const data = await response.json();

    if (!response.ok) {
      // サーバー側のバリデーションエラー
      if (response.status === 422 && data.errors) {
        const fieldErrors: RegisterFieldErrors = {};

        // Laravel形式のエラーをマッピング
        if (data.errors.email) {
          fieldErrors.email = data.errors.email;
        }
        if (data.errors.password) {
          fieldErrors.password = data.errors.password;
        }
        if (data.errors.name) {
          fieldErrors.name = data.errors.name;
        }

        return {
          success: false,
          error: data.message || 'バリデーションエラーがあります',
          fieldErrors,
        };
      }

      return {
        success: false,
        error: data.message || '登録に失敗しました',
      };
    }

    return {
      success: true,
      message: 'アカウントが作成されました。メールを確認してください。',
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      error: 'ネットワークエラーが発生しました',
    };
  }
}

/**
 * パスワードリセットリクエストを送信
 */
export async function requestPasswordReset(email: string) {
  try {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://todo-express:3000';
    const response = await fetch(`${apiBaseUrl}/api/user/reset_password/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "パスワード初期化に失敗しました",
      };
    }

    return {
      success: true,
      message: "パスワードリセット用のメールを送信しました",
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      message: "予期せぬエラーが発生しました",
    };
  }
}

// バリデーションスキーマ（パスワードリセット用）
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'トークンが無効です'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/[A-Za-z]/, 'パスワードには英字を含めてください')
    .regex(/[0-9]/, 'パスワードには数字を含めてください'),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'パスワードが一致しません',
  path: ['passwordConfirmation'],
});

export type ResetPasswordFieldErrors = {
  token?: string[];
  password?: string[];
  passwordConfirmation?: string[];
};

/**
 * パスワードをリセット
 */
export async function resetPassword(formData: FormData) {
  const token = formData.get('token');
  const password = formData.get('password');
  const passwordConfirmation = formData.get('passwordConfirmation');

  // バリデーション
  const validationResult = resetPasswordSchema.safeParse({
    token,
    password,
    passwordConfirmation,
  });

  if (!validationResult.success) {
    const fieldErrors: ResetPasswordFieldErrors = {};
    validationResult.error.errors.forEach((error) => {
      const field = error.path[0] as keyof ResetPasswordFieldErrors;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field]!.push(error.message);
    });

    return {
      success: false,
      error: 'バリデーションエラーがあります',
      fieldErrors,
    };
  }

  try {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://todo-express:3000';
    const response = await fetch(`${apiBaseUrl}/api/user/reset_password/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: validationResult.data.token,
        password: validationResult.data.password,
        password_confirmation: validationResult.data.passwordConfirmation,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // サーバー側のバリデーションエラー
      if (response.status === 422 && data.errors) {
        const fieldErrors: ResetPasswordFieldErrors = {};

        if (data.errors.token) {
          fieldErrors.token = data.errors.token;
        }
        if (data.errors.password) {
          fieldErrors.password = data.errors.password;
        }

        return {
          success: false,
          error: data.message || 'バリデーションエラーがあります',
          fieldErrors,
        };
      }

      return {
        success: false,
        error: data.message || 'パスワードリセットに失敗しました',
      };
    }

    return {
      success: true,
      message: 'パスワードが正常に変更されました',
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: "予期せぬエラーが発生しました",
    };
  }
}

/**
 * アカウントを認証
 */
export async function verifyAccount(token: string) {
  try {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://todo-express:3000';
    const response = await fetch(`${apiBaseUrl}/api/user/verify/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "アカウント認証に失敗しました",
      };
    }

    return {
      success: true,
      message: "アカウントの認証が完了しました",
    };
  } catch (error) {
    console.error("Account verification error:", error);
    return {
      success: false,
      message: "予期せぬエラーが発生しました",
    };
  }
}
