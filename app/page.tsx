import LoginForm from "@/components/Login/LoginForm";
import Link from "next/link";


export default function Home() {
  return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm ">

          <LoginForm/>
          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Do not have an account?{' '}
            <Link href="/signup" className="font-semibold text-[#000080] hover:text-indigo-500 dark:text-indigo-700">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
  );
}
