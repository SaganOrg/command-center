
import { Card, CardContent } from "@/components/ui/card";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { MessageSquare, Star } from "lucide-react";


const testimonials = [
  {
    quote: "Sagan Command Center has completely transformed how my team manages projects. This assistant have saved us countless hours of manual work.",
    author: "Jon Matzner",
    role: "Owner",
    company: "Sagan World",
    rating: 5,
  },
  {
    quote: "The End of Day reports have been a game-changer for our remote team. We know exactly what everyone has accomplished without micromanaging.",
    author: "Binsi Das",
    role: "Team Lead",
    company: "Sagan World",
    rating: 5,
  },
  {
    quote: "We've tried countless project management tools, but none have been as intuitive and powerful as TaskFlow. This assistant is like having additional team members.",
    author: "Emily Rodriguez",
    role: "Operations Director",
    company: "Global Systems",
    rating: 5,
  },
  {
    quote: "Sagan command center's mobile app lets me stay on top of projects even when I'm away from my desk. The file attachment feature is incredibly convenient.",
    author: "David Kim",
    role: "Creative Director",
    company: "Design Studio",
    rating: 4,
  },
];

const TestimonialsNew = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-slide-down">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            What Our Customers Say
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Join thousands of satisfied teams who have transformed their workflow with Sagan Command Center
          </p>
        </div>
        
        <div className="mt-12 animate-slide-up">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/2 pl-4">
                  <Card className="border border-border shadow-lg card-hover h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="mb-6 flex justify-between items-center">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      
                      <blockquote className="flex-grow">
                        <p className="text-lg text-foreground/90 italic mb-6">"{testimonial.quote}"</p>
                      </blockquote>
                      
                      <div className="mt-auto pt-6 border-t border-border">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-lg">
                            {testimonial.author.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <p className="font-semibold">{testimonial.author}</p>
                            <p className="text-sm text-foreground/70">{testimonial.role}, {testimonial.company}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8">
              <CarouselPrevious className="relative static translate-y-0 left-0 mr-2" />
              <CarouselNext className="relative static translate-y-0 right-0 ml-2" />
            </div>
          </Carousel>
        </div>
        
        <div className="mt-16 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center px-6 py-3 bg-primary/10 rounded-full">
            <p className="text-lg font-medium gradient-text">Join 2,000+ companies using Sagan Command Center</p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-12 opacity-70">
            {["TechCorp", "Innovate Inc", "Global Systems", "Design Studio", "FutureWorks"].map((company, idx) => (
              <div key={idx} className="grayscale hover:grayscale-0 transition-all">
                <p className="text-xl font-bold">{company}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsNew;