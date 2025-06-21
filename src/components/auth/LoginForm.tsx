import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(data.email, data.password);
      if (!success) {
        setError('Email atau kata sandi tidak valid');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    reset();
    setError('');
    onToggleMode();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center text-gray-900">Masuk</h2>
        <p className="text-center text-gray-600">Akses sistem manajemen agenda rapat</p>
        {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">Akun Demo:</p>
          <p className="text-xs text-blue-600">sukmaayutirtaningrum@gmail.com / Sukma@1234</p>
          <p className="text-xs text-blue-600">john@rapat.com / user123</p>
        </div> */}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            {...register('email', { 
              required: 'Email wajib diisi',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Format email tidak valid'
              }
            })}
            error={errors.email?.message}
          />
          
          <Input
            label="Kata Sandi"
            type="password"
            autoComplete="current-password"
            {...register('password', { 
              required: 'Kata sandi wajib diisi',
              minLength: {
                value: 6,
                message: 'Kata sandi minimal 6 karakter'
              }
            })}
            error={errors.password?.message}
          />
          
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sedang masuk...' : 'Masuk'}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Belum punya akun? Daftar
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};