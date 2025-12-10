import { Card, CardBody, Button, Chip } from '@heroui/react';
import { 
  FaceFrownIcon, 
  HomeIcon, 
  CodeBracketIcon,
  CubeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2230%22 height=%2230%22 viewBox=%220 0 30 30%22 fill=%22none%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z%22 fill=%22rgba(255,255,255,0.07)%22/%3E%3C/svg%3E')] opacity-100"></div>
        <div className="relative z-10 py-6 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CubeIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">Roxeleye CRUD</span>
            </a>
            <div className="flex items-center gap-2">
              <Chip variant="flat" className="bg-white/20 text-white backdrop-blur-sm">Node.js</Chip>
              <Chip variant="flat" className="bg-white/20 text-white backdrop-blur-sm hidden sm:flex">Express</Chip>
              <Chip variant="flat" className="bg-white/20 text-white backdrop-blur-sm hidden sm:flex">Prisma</Chip>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          
          <Card className="max-w-lg w-full shadow-2xl border-none bg-white/80 backdrop-blur-sm relative">
            <CardBody className="text-center py-16 px-8">
              {/* Animated Icon */}
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center animate-bounce">
                  <FaceFrownIcon className="w-16 h-16 text-indigo-500" />
                </div>
              </div>
              
              {/* Error Code */}
              <h1 className="text-8xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
                404
              </h1>
              
              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Page Not Found
              </h2>
              
              {/* Description */}
              <p className="text-gray-500 mb-10 leading-relaxed max-w-md mx-auto">
                Oops! The page you're looking for doesn't exist or has been moved. 
                Let's get you back on track.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  as="a"
                  href="/"
                  color="primary"
                  size="lg"
                  startContent={<HomeIcon className="w-5 h-5" />}
                  className="font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  Go Home
                </Button>
                
                <Button
                  as="a"
                  href="/api/items"
                  target="_blank"
                  variant="bordered"
                  size="lg"
                  startContent={<CodeBracketIcon className="w-5 h-5" />}
                  className="font-semibold border-gray-200 hover:border-indigo-400"
                >
                  View API
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
            <a href="/" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Home
            </a>
            <span className="hidden sm:inline">•</span>
            <span>
              Built with ❤️ using <span className="font-semibold text-indigo-600">React + HeroUI</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Animation styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
