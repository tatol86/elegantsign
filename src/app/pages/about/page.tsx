import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">About ElegantSign</h1>

            <div className="prose prose-neutral max-w-none space-y-6 text-lg text-neutral-600">
                <p>
                    We believe that the first impression of your home or business matters.
                    That&apos;s why ElegantSign was created: to offer premium, architecturally-inspired
                    address signage and 3D printed utility pieces that elevate your facade.
                </p>

                <p>
                    Based in Australia, we design, manufacture, and assemble every piece locally.
                    Our materials are carefully chosen for longevity—whether it&apos;s our UV-stabilised
                    acrylics that withstand the harsh Australian sun, or our aerospace-grade ASA
                    and durable PETG polymers used in our 3D printed range.
                </p>

                <h2 className="text-2xl font-semibold text-black mt-12 mb-6">Our Process</h2>

                <div className="grid md:grid-cols-3 gap-6 my-10">
                    <Card className="bg-neutral-50 border-none shadow-none">
                        <CardContent className="pt-6">
                            <h3 className="font-bold mb-2">1. Design</h3>
                            <p className="text-sm">Every typeface and layout is carefully considered to maximize visibility and aesthetic appeal.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-neutral-50 border-none shadow-none">
                        <CardContent className="pt-6">
                            <h3 className="font-bold mb-2">2. Precision Cut</h3>
                            <p className="text-sm">We use state-of-the-art laser cutting and 3D printing technology for unmatched precision.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-neutral-50 border-none shadow-none">
                        <CardContent className="pt-6">
                            <h3 className="font-bold mb-2">3. Hand Finish</h3>
                            <p className="text-sm">Each piece is hand-inspected, assembled, and securely packaged before it leaves our workshop.</p>
                        </CardContent>
                    </Card>
                </div>

                <p>
                    Thank you for supporting Australian manufacturing. We look forward to creating
                    something beautiful for your home.
                </p>
            </div>
        </div>
    );
}

