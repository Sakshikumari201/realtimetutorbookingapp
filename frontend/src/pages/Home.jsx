import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-bg-canvas to-bg-canvas -z-10" />
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            Master Any Subject with Expert Tutors
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10"
          >
            Connect with top-rated tutors for 1-on-1 learning.
            Boost your grades, build streaks, and achieve your academic goals.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-ghost border border-border text-lg px-8 py-3">
              Login
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-bg-elevated/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose TutorBooking?</h2>
            <p className="text-text-secondary">Everything you need to succeed in your learning journey.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎓"
              title="Expert Tutors"
              description="Find verified and rated tutors in Math, Physics, Chemistry, and more."
            />
            <FeatureCard
              icon="🔥"
              title="Learning Streaks"
              description="Stay motivated by tracking your daily learning activity and earning rewards."
            />
            <FeatureCard
              icon="📚"
              title="Resource Library"
              description="Access exclusive study materials, videos, and notes shared by your tutors."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">About Our Platform</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              We believe that personalized learning is the key to unlocking every student's potential.
              Our platform bridges the gap between ambitious students and passionate educators.
            </p>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Whether you need help with a specific problem or long-term guidance,
              TutorBooking provides the tools and community you need to excel.
            </p>
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Join our community today &rarr;
            </Link>
          </div>
          <div className="bg-bg-elevated rounded-2xl p-8 border border-border">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">🌍</div>
                <div>
                  <h4 className="font-bold">Global Access</h4>
                  <p className="text-sm text-text-secondary">Learn from anywhere, anytime.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-2xl">🔒</div>
                <div>
                  <h4 className="font-bold">Secure Booking</h4>
                  <p className="text-sm text-text-secondary">Safe and easy scheduling.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl">💬</div>
                <div>
                  <h4 className="font-bold">Instant Chat</h4>
                  <p className="text-sm text-text-secondary">Communicate directly with tutors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center text-text-secondary text-sm">
          &copy; {new Date().getFullYear()} TutorBooking. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="card p-6 border border-border hover:border-primary/50 transition-colors"
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-text-secondary">{description}</p>
  </motion.div>
);

export default Home;
