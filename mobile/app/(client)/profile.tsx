import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../src/components/ui/Card";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  LogOut,
  ChevronRight,
  Edit,
  Trophy,
  Users,
} from "lucide-react-native";
import api from "../../src/api/axios";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useRouter } from "expo-router";
import { StatusBadge } from "../../src/components/StatusBadge";

export default function Profile() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEvents: 0,
    completedEvents: 0,
    points: 0,
    rank: "-",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/registration");
        const registrations = res.data.data || [];

        const activeEvents = registrations.filter(
          (r: any) =>
            r.event?.status === "active" || r.event?.status === "running",
        );

        const completedEvents = registrations.filter(
          (r: any) => r.event?.status === "completed",
        );

        const totalPoints = registrations.reduce(
          (sum: number, r: any) => sum + (r.points || 0),
          0,
        );

        // Find highest rank
        const ranks = registrations
          .map((r: any) => r.rank)
          .filter((r: any) => r !== null && r !== undefined);
        const highestRank = ranks.length > 0 ? Math.min(...ranks) : "-";

        setStats({
          totalEvents: registrations.length,
          completedEvents: completedEvents.length,
          points: totalPoints,
          rank: highestRank as string,
        });
      } catch (error) {
        console.error("Profile Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: logout, style: "destructive" },
    ]);
  };

  if (loading) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size='large' color='hsl(173, 50%, 50%)' />
      </View>
    );
  }

  return (
    <ScrollView
      className='flex-1 bg-background'
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
    >
      {/* Header */}
      <View className='mb-6 mt-2'>
        <Text className='text-3xl font-extrabold text-foreground mb-1'>
          Profile
        </Text>
        <Text className='text-muted-foreground text-sm'>
          Manage your account and view your stats
        </Text>
      </View>

      {/* User Info Card */}
      <Card className='mb-6'>
        <CardHeader className='pb-3'>
          <View className='flex-row items-center justify-between w-full'>
            <View className='flex-row items-center gap-3'>
              <View className='bg-primary/10 p-3 rounded-xl'>
                <User size={28} color='hsl(173, 50%, 50%)' />
              </View>
              <View>
                <Text className='text-foreground font-bold text-xl'>
                  {user?.name || "User"}
                </Text>
                <Text className='text-muted-foreground text-sm'>
                  {user?.email}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(client)/edit-profile" as any)}
              className='bg-primary/10 px-3 py-2 rounded-full'
            >
              <Text className='text-primary text-xs font-bold'>Edit</Text>
            </TouchableOpacity>
          </View>
        </CardHeader>
        <CardContent>
          <View className='flex-row items-center gap-2 mb-4'>
            <Shield size={14} color='hsl(0, 0%, 70%)' />
            <Text className='text-muted-foreground text-sm capitalize'>
              {user?.role}
            </Text>
          </View>

          <View className='flex-row items-center gap-2 mb-2'>
            <Phone size={14} color='hsl(0, 0%, 70%)' />
            <Text className='text-muted-foreground text-sm'>
              {user?.phone || "Not provided"}
            </Text>
          </View>

          <View className='flex-row items-center gap-2'>
            <Calendar size={14} color='hsl(0, 0%, 70%)' />
            <Text className='text-muted-foreground text-sm'>
              Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })
                : "-"}
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <View className='flex-row gap-3 mb-6'>
        <Card className='flex-1'>
          <CardHeader className='pb-2'>
            <View className='flex-row items-center gap-2'>
              <Trophy size={16} color='hsl(173, 50%, 50%)' />
              <CardTitle>Rank</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <Text className='text-foreground font-bold text-2xl mb-1'>
              {stats.rank}
            </Text>
            <Text className='text-muted-foreground text-xs'>Best Position</Text>
          </CardContent>
        </Card>

        <Card className='flex-1'>
          <CardHeader className='pb-2'>
            <View className='flex-row items-center gap-2'>
              <Users size={16} color='hsl(173, 50%, 50%)' />
              <CardTitle>Events</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <Text className='text-foreground font-bold text-2xl mb-1'>
              {stats.totalEvents}
            </Text>
            <Text className='text-muted-foreground text-xs'>
              Total Participations
            </Text>
          </CardContent>
        </Card>
      </View>

      <Card className='mb-6'>
        <CardHeader className='pb-2'>
          <View className='flex-row items-center gap-2'>
            <Calendar size={16} color='hsl(173, 50%, 50%)' />
            <CardTitle>Completed Events</CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <Text className='text-foreground font-bold text-2xl mb-1'>
            {stats.completedEvents}
          </Text>
          <Text className='text-muted-foreground text-xs'>Finished events</Text>
        </CardContent>
      </Card>

      <Card className='mb-6'>
        <CardHeader className='pb-2'>
          <View className='flex-row items-center gap-2'>
            <Trophy size={16} color='hsl(173, 50%, 50%)' />
            <CardTitle>Total Points</CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <Text className='text-foreground font-bold text-2xl mb-1'>
            {stats.points}
          </Text>
          <Text className='text-muted-foreground text-xs'>
            Accumulated points
          </Text>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        className='flex-row items-center justify-center bg-destructive/10 px-4 py-4 rounded-xl border border-destructive/20'
      >
        <LogOut size={20} color='hsl(0, 84%, 60%)' />
        <Text className='text-destructive font-bold text-base ml-2'>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
