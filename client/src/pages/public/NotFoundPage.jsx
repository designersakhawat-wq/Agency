import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center text-center px-4 pt-24">
      <div className="max-w-md space-y-6">
        <span className="font-display font-black text-8xl gradient-brand block">
          404
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          The page you are looking for does not exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" size="md" icon={Home}>
              Back to Home
            </Button>
          </Link>
          <Link to="/portfolio">
            <Button variant="outline" size="md">
              View Portfolio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
