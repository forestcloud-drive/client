import { Tab } from '@/components/authpage/tabs/Tab';
import { TabSelector } from '@/components/authpage/tabs/TabSelector';
import { SetStateAction } from 'react';

interface AuthTabSelectorProperties {
  isLogin: boolean;
  setIsLogin: (value: SetStateAction<boolean>) => void;
}

export const AuthTabSelector = ({
  isLogin,
  setIsLogin,
}: AuthTabSelectorProperties) => {
  return (
    <TabSelector>
      <Tab
        className={`w-1/2 py-3 font-semibold transition-transform duration-200 ease-in-out
              ${isLogin ? 'text-green-800' : 'text-gray-500 hover:text-green-700 hover:scale-105 cursor-pointer'}`}
        text={'Login'}
        onClick={() => setIsLogin(true)}
      />

      <Tab
        className={`w-1/2 py-3 font-semibold transition-transform duration-200 ease-in-out
              ${!isLogin ? 'text-green-800' : 'text-gray-500 hover:text-green-700 hover:scale-105 cursor-pointer'}`}
        text={'Registration'}
        onClick={() => setIsLogin(false)}
      />

      <div
        className="absolute bottom-0 h-1 bg-green-600 transition-all duration-300"
        style={{ width: '50%', left: isLogin ? '0%' : '50%' }}
      ></div>
    </TabSelector>
  );
};
