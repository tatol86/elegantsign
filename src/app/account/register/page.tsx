import RegisterForm from '@/app/account/register/RegisterForm';

export default function CustomerRegisterPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const nextPath = typeof searchParams.next === 'string' ? searchParams.next : '/account';
  return <RegisterForm nextPath={nextPath} />;
}
