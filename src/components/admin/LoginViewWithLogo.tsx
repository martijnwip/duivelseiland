import { LoginViewWrapper } from '@delmaredigital/payload-better-auth/rsc';
import LoginLogo from './LoginLogo';

export default function LoginViewWithLogo(props: Parameters<typeof LoginViewWrapper>[0]) {
  return (
    <>
      <LoginLogo />
      <LoginViewWrapper {...props} />
    </>
  );
}
