import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<RegisterFormData>();
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const success = await registerUser(data.name, data.email, data.password);
      if (!success) {
        setError('Pendaftaran gagal. Email mungkin sudah digunakan.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Pendaftaran gagal. Silakan coba lagi.');
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
        <h2 className="text-2xl font-bold text-center text-gray-900">Daftar</h2>
        <p className="text-center text-gray-600">Buat akun untuk memulai</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Lengkap"
            type="text"
            autoComplete="name"
            {...register('name', { 
              required: 'Nama wajib diisi',
              minLength: {
                value: 2,
                message: 'Nama minimal 2 karakter'
              },
              maxLength: {
                value: 50,
                message: 'Nama maksimal 50 karakter'
              }
            })}
            error={errors.name?.message}
          />
          
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
            autoComplete="new-password"
            {...register('password', { 
              required: 'Kata sandi wajib diisi',
              minLength: {
                value: 6,
                message: 'Kata sandi minimal 6 karakter'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Kata sandi harus mengandung huruf besar, huruf kecil, dan angka'
              }
            })}
            error={errors.password?.message}
          />
          
          <Input
            label="Konfirmasi Kata Sandi"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword', { 
              required: 'Konfirmasi kata sandi wajib diisi',
              validate: value => {
                if (!password) return true;
                return value === password || 'Kata sandi tidak cocok';
              }
            })}
            error={errors.confirmPassword?.message}
          />
          
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sedang mendaftar...' : 'Daftar'}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Sudah punya akun? Masuk
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};