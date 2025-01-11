import { motion } from 'framer-motion';
import { ArrowRight, Activity, Clock, Calendar, Linkedin, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="container mx-auto flex justify-center items-center px-4 py-20 pt-30 pb-40">
        <div className="grid md:grid-cols-2 gap-16 justify-center items-center">
          <motion.div
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Streamline Your Hospital Management
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Efficient patient management for modern healthcare facilities.
            </p>
            <p className='text-lg text-muted-foreground mb-8'>
            Our system is designed to provide you with effortless access to top-notch healthcare services. Explore our features today!
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link to="/opd-queue">
                  Join OPD Queue <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/bed-booking">Book a Bed</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80"
              alt="Hospital Management"
              className="rounded-lg shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-lg shadow-lg border">
              <div className="flex items-center gap-3">
                <Activity className="text-primary h-5 w-5" />
                <span className="font-medium">Real-time Updates</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground">
              Our comprehensive hospital management system streamlines patient care and resource allocation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-background p-6 rounded-lg shadow-lg border"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-muted-foreground">Meet our talented team of developers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                className="group relative"
              >
                <div className="bg-background rounded-xl overflow-hidden shadow-lg transform transition-transform duration-300 group-hover:scale-105">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{member.college}</p>
                    
                    <div className="flex gap-3">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="text-primary"
                    >
                      <Activity className="h-5 w-5" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: 'OPD Queue Management',
    description: 'Efficiently manage outpatient department queues with real-time updates and notifications.',
    icon: Clock,
  },
  {
    title: 'Bed Booking System',
    description: 'Streamlined bed allocation system for better patient care and resource management.',
    icon: Calendar,
  },
  {
    title: 'Admin Dashboard',
    description: 'Comprehensive dashboard for hospital administrators to monitor and manage operations.',
    icon: Activity,
  },
];

const teamMembers = [
  {
    name: 'Ajinkya Goundadkar',
    college: 'Kle Technological University, Belgaum',
    linkedin: 'https://www.linkedin.com/in/ajinkya-goundadkar-1aa273300/',
    photo: 'https://pub-d75c4476cafd4ecca54e6cdc5e180150.r2.dev/ajinkya.JPG',
  },
  {
    name: 'Ishan Lokari',
    college: 'KLE Technological University, Belgaum',
    linkedin: 'https://www.linkedin.com/in/ishan-l-35938025a/',
    photo: 'https://pub-d75c4476cafd4ecca54e6cdc5e180150.r2.dev/ishan.JPG',
  },
  {
    name: 'Shreya Kutre',
    college: 'KLE Technological University, Belgaum',
    instagram: 'https://www.instagram.com/shreya__kutre/',
    photo: 'https://pub-d75c4476cafd4ecca54e6cdc5e180150.r2.dev/shreya.JPG',
  },
  {
    name: 'Umarani Bharamanaikar',
    college: 'KLE Technological University, Belgaum',
    linkedin: 'https://www.linkedin.com/in/uma-bharamanaikar-a92626283/',
    photo: 'https://pub-d75c4476cafd4ecca54e6cdc5e180150.r2.dev/umarani.JPG',
  },
];