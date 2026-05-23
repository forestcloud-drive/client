import { Input } from '@/components/authpage/forms/inputs/Input';
import { DefaultButton } from '@/components/buttons/DefaultButton';
import { SetStateAction } from 'react';

interface LoginFormProperties {
  email: string;
  setEmail: (value: SetStateAction<string>) => void;
  password: string;
  setPassword: (value: SetStateAction<string>) => void;
  handleAuth: () => void;
}

export const LoginForm = ({
  email,
  password,
  setEmail,
  setPassword,
  handleAuth,
}: LoginFormProperties) => {
  return (
    <>
      <div className="w-1/2 flex items-center justify-center h-full">
        <div className="w-full p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-green-800">
            Login
          </h2>

          <Input
            type={'email'}
            placeholder={'Email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired={true}
            autoComplete="off"
          />
          <Input
            type={'password'}
            placeholder={'Password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired={true}
            autoComplete="off"
            showToggle={true}
          />

          <div className="flex justify-center">
            <DefaultButton onClick={handleAuth} text="Sign In" />
          </div>
        </div>
      </div>
    </>
  );
};
