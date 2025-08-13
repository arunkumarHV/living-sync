import { useState } from 'react';
import { Eye, EyeOff, Building2, Lock, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { DUMMY_CREDENTIALS } from '@/types/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [selectedRole, setSelectedRole] = useState<string>('Admin');
  const { login, loading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  };

  const fillDummyCredentials = (role: string) => {
    const creds = DUMMY_CREDENTIALS[role as keyof typeof DUMMY_CREDENTIALS];
    setCredentials(creds);
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="gradient-hero p-3 rounded-xl shadow-glow">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-hero bg-clip-text text-transparent">
                  HostelHub
                </h1>
                <p className="text-muted-foreground text-lg">Smart Hostel Management</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Welcome to the Future of 
                <span className="gradient-hero bg-clip-text text-transparent"> Hostel Management</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Experience seamless hostel operations with our comprehensive management system. 
                From student onboarding to AI-powered analytics, everything you need in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="card-elevated p-4 rounded-xl">
                <h3 className="font-semibold text-primary mb-2">Smart Analytics</h3>
                <p className="text-sm text-muted-foreground">AI-powered insights for better decision making</p>
              </div>
              <div className="card-elevated p-4 rounded-xl">
                <h3 className="font-semibold text-primary mb-2">Real-time Tracking</h3>
                <p className="text-sm text-muted-foreground">Monitor attendance, fees, and requests instantly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="card-elevated border-0">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto gradient-hero p-3 rounded-xl w-fit shadow-glow">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access the system</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Demo Credentials */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Login (Demo)</Label>
                <Tabs value={selectedRole} onValueChange={setSelectedRole} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="Admin" className="text-xs">Admin</TabsTrigger>
                    <TabsTrigger value="Warden" className="text-xs">Warden</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid w-full grid-cols-2 mt-1">
                    <TabsTrigger value="Management" className="text-xs">Management</TabsTrigger>
                    <TabsTrigger value="Student" className="text-xs">Student</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(DUMMY_CREDENTIALS).map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      onClick={() => fillDummyCredentials(role)}
                      className="text-xs"
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      className="pl-10 transition-all focus:shadow-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="pl-10 pr-10 transition-all focus:shadow-medium"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Demo System - Use the quick login buttons above
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}