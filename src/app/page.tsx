import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100">
      <h1 className="text-3xl font-bold">Demo Đăng nhập Google</h1>

      {session && session.user ? (
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <img
            src={session.user.image || ""}
            alt="Avatar"
            className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-blue-500"
          />
          <p className="text-xl font-semibold">{session.user.name}</p>
          <p className="text-gray-500 mb-6">{session.user.email}</p>
          
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition">
              Đăng xuất
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-md">
          <p className="mb-4 text-gray-600">Bạn chưa đăng nhập</p>
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition">
              <span>G</span> Đăng nhập bằng Google
            </button>
          </form>
        </div>
      )}
    </div>
  );
}