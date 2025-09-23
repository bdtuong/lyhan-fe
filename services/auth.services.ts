const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(email: string, password: string) {
  console.log("[AuthService] login payload:", { email, password });

  const res = await fetch(`${API_URL}/v1/Auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  console.log("[AuthService] login status:", res.status);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[AuthService] login error response:", err);
    throw new Error(err.message || "Đăng nhập thất bại");
  }

  const data = await res.json();
  console.log("[AuthService] login success response:", data);
  return data; // { access_token }
}

export async function register(username: string, email: string, password: string, confirmPassword: string) {
  console.log("[AuthService] register payload:", { username, email, password, confirmPassword });

  const res = await fetch(`${API_URL}/v1/Auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, confirmPassword }),
  });

  console.log("[AuthService] register status:", res.status);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[AuthService] register error response:", err);
    throw new Error(err.message || "Đăng ký thất bại");
  }

  const data = await res.json();
  console.log("[AuthService] register success response:", data);
  return data; // { access_token }
}


// Lấy username + avatar
export async function getUser(userId: string, token: string) {
  const res = await fetch(`${API_URL}/v1/Auth/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Không tìm thấy user");
  }

  return res.json(); // { username, avatar, ... }
}

// Chỉ lấy avatar
export async function getAvatar(userId: string, token: string) {
  const res = await fetch(`${API_URL}/v1/Auth/get-avatar/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Không tìm thấy avatar");
  }

  const data = await res.json();
  return data.avatarUrl;
}

/**
 * Upload avatar cho user
 * @param userId string - id của user (Mongo _id)
 * @param file File - ảnh chọn từ input
 * @returns { avatarUrl: string }
 */
export async function uploadAvatar(userId: string, file: File) {
  const formData = new FormData()
  formData.append("avatar", file)

  const res = await fetch(`http://localhost:8017/v1/Auth/avatar/${userId}`, {
    method: "PUT",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "Upload avatar thất bại")
  }

  return res.json()
}
