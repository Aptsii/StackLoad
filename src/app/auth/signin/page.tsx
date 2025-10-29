"use client";

import { signIn, getProviders, useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, Mail } from "lucide-react";
import { getCallbackUrl } from "@/lib/auth-redirect";

interface Provider {
  id: string;
  name: string;
  type: string;
}

const providerIcons: { [key: string]: React.ReactNode } = {
  github: <Github className="w-4 h-4" />,
  google: <Mail className="w-4 h-4" />,
  kakao: (
    <div className="w-4 h-4 bg-[#FEE500] rounded-full flex items-center justify-center">
      <span className="text-[10px] font-bold text-black">K</span>
    </div>
  ),
  naver: (
    <div className="w-4 h-4 bg-[#03C75A] rounded-full flex items-center justify-center">
      <span className="text-[10px] font-bold text-white">N</span>
    </div>
  ),
};

function SignInContent() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(
    null
  );
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function loadProviders() {
      const res = await getProviders();
      setProviders(res);
    }
    loadProviders();
  }, []);

  // 이미 로그인된 사용자는 리다이렉트
  useEffect(() => {
    if (status === "authenticated" && session) {
      const callbackUrl = getCallbackUrl("/");
      router.push(callbackUrl);
    }
  }, [status, session, router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            소셜 계정으로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 활성화된 프로바이더 (구글만) */}
          {providers && Object.values(providers).length > 0 && (
            <div className="space-y-3 mb-6">
              {Object.values(providers).map((provider) => (
                <Button
                  key={provider.name}
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    signIn(provider.id, { callbackUrl: getCallbackUrl("/") })
                  }
                >
                  {providerIcons[provider.id]}
                  <span className="ml-2">{provider.name}로 로그인</span>
                </Button>
              ))}
            </div>
          )}

          {/* 준비 중인 프로바이더들 */}
          <div className="space-y-2">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-500">준비 중인 로그인 서비스</p>
            </div>

            {/* GitHub 준비중 */}
            <Button
              variant="outline"
              className="w-full opacity-50 cursor-not-allowed"
              disabled
            >
              {providerIcons.github}
              <span className="ml-2">GitHub로 로그인</span>
              <span className="ml-auto text-xs text-gray-400">준비중</span>
            </Button>

            {/* Kakao 준비중 */}
            <Button
              variant="outline"
              className="w-full opacity-50 cursor-not-allowed"
              disabled
            >
              {providerIcons.kakao}
              <span className="ml-2">카카오로 로그인</span>
              <span className="ml-auto text-xs text-gray-400">준비중</span>
            </Button>

            {/* Naver 준비중 */}
            <Button
              variant="outline"
              className="w-full opacity-50 cursor-not-allowed"
              disabled
            >
              {providerIcons.naver}
              <span className="ml-2">네이버로 로그인</span>
              <span className="ml-auto text-xs text-gray-400">준비중</span>
            </Button>
          </div>

          {/* 프로바이더가 없을 때 */}
          {(!providers || Object.values(providers).length === 0) && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                현재 로그인 서비스를 준비 중입니다.
              </div>
              <p className="text-sm text-gray-400">
                OAuth 프로바이더 설정이 필요합니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">로딩 중...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
