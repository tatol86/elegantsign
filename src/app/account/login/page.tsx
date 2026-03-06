import LoginForm from '@/app/account/login/LoginForm';

export default function CustomerLoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const nextPath = typeof searchParams.next === 'string' ? searchParams.next : '/account';
  return <LoginForm nextPath={nextPath} />;
}
