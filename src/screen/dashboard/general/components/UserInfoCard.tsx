import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/clerk-react";
import { Calendar, Mail, Sparkles, User } from "lucide-react";

export function UserInfoCard() {
  const { user } = useUser();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" />
              Welcome Back!
            </CardTitle>
            <CardDescription className="text-base">
              Here's an overview of your account
            </CardDescription>
          </div>
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(user?.fullName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors">
            <div className="p-2 bg-primary/10 rounded-md">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Full Name
              </p>
              <p className="text-sm font-semibold text-foreground">
                {user?.fullName || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors">
            <div className="p-2 bg-primary/10 rounded-md">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Email Address
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.primaryEmailAddress?.emailAddress || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors">
            <div className="p-2 bg-primary/10 rounded-md">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Member Since
              </p>
              <p className="text-sm font-semibold text-foreground">
                {user?.createdAt
                  ? formatDate(new Date(user.createdAt))
                  : "Not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Badge variant="secondary" className="text-xs font-medium">
            Active Account
          </Badge>
          <Badge variant="outline" className="text-xs font-medium">
            Pro Member
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
