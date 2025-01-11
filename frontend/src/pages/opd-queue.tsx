import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { BASE_URL } from '@/utils';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.string().transform(Number).pipe(z.number().min(0).max(150)),
  gender: z.string(),
  phoneNo: z.string().min(10, 'Phone number must be at least 10 digits'),
  symptoms: z.string().min(10, 'Please describe your symptoms (min 10 characters)'),
  hospital: z.string(),
});

export default function OPDQueue() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitals,setHospitals] = useState<any>([]);

  useEffect(()=>{
    async function getHospitals(){
      const res = await axios.get(`${BASE_URL}/hospital`);
      setHospitals(Array.isArray(res.data.hospitals) ? res.data.hospitals : []);
    }
    getHospitals();
  },[])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      age: 0,
      gender: '',
      phoneNo: '',
      symptoms: '',
      hospital: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${BASE_URL}/opd/join`,{
        name: values.name,
        age: values.age,
        phoneNo: values.phoneNo,
        gender: values.gender,
        symptoms: values.symptoms,
        hospital: values.hospital
      })
      toast.success(response.data.message);
      form.reset();
    } catch (error) {
      console.log(error);
      toast.error('Failed to join queue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Join OPD Queue</h1>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-lg border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter patient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter age"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phoneNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptoms</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your symptoms"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hospital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospital</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hospital" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {hospitals.map((hospital: any, id: any) => (
                          <SelectItem key={id} value={hospital.name}>{hospital.name}</SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Join Queue
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}