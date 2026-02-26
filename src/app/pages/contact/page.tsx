"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Message Sent",
            description: "Thanks for reaching out! We will get back to you within 24 hours.",
        });
        // Reset form in a real app
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Contact Us</h1>
            <p className="text-lg text-neutral-600 mb-12">
                Have a question about a custom order or need help with installation? Send us a message below.
            </p>

            <div className="grid md:grid-cols-2 gap-16">
                <div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                                <Input id="firstName" required placeholder="Jane" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                                <Input id="lastName" required placeholder="Doe" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                            <Input id="email" type="email" required placeholder="jane@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="orderNum" className="text-sm font-medium">Order Number (Optional)</label>
                            <Input id="orderNum" placeholder="#MS12345" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium">Message</label>
                            <Textarea id="message" required placeholder="How can we help you?" className="min-h-[150px]" />
                        </div>
                        <Button type="submit" size="lg" className="w-full">Send Message</Button>
                    </form>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Business Hours</h3>
                        <p className="text-neutral-600">Monday - Friday: 9am - 5pm AEST</p>
                        <p className="text-neutral-600">Closed weekends and public holidays.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Location</h3>
                        <p className="text-neutral-600">
                            ElegantSign Workshop<br />
                            (Online Orders Only - No public showroom)<br />
                            Sydney, NSW, Australia
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Email</h3>
                        <p className="text-neutral-600">support@elegantsign.com.au</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

