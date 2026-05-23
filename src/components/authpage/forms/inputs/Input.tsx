import { ChangeEventHandler, HTMLInputTypeAttribute, useState } from 'react';
import clsx from 'clsx';

interface InputProperties {
  type: HTMLInputTypeAttribute;
  placeholder: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  isRequired?: boolean;
  autoComplete?: string;
  showToggle?: boolean;
}

export const Input = ({
  type,
  placeholder,
  value,
  onChange,
  isRequired = false,
  autoComplete,
  showToggle = false,
}: InputProperties) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const shouldFloat = isFocused || value.length > 0;
  
  const inputType = showToggle && showPassword ? 'text' : type;

  return (
    <div className="relative w-full mb-6">
      <div
        className={clsx(
          'relative w-full rounded-xl border-2 transition-all duration-200',
          shouldFloat ? 'border-green-600' : 'border-gray-400',
        )}
      >
        {/* Floating label that cuts the border */}
        <span
          className={clsx(
            'absolute left-4 px-1 transition-all duration-200 text-sm pointer-events-none z-0',
            shouldFloat
              ? '-top-2 text-gray-400 text-xs bg-gray-100 rounded-md border border-green-600 border'
              : 'top-1/2 -translate-y-1/2 text-gray-400 bg-transparent',
          )}
        >
          {placeholder}
        </span>

        {/* Input field */}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={isRequired}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full px-4 pt-5 pb-2 bg-transparent text-gray-700 placeholder-transparent rounded-xl focus:outline-none"
        />

        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.38-3.468M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.31.96-1.042 2.05-2.074 3.01M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
