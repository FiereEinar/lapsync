import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { Card, CardContent } from "../../src/components/ui/Card";
import { useAuthStore } from "../../src/store/useAuthStore";
import api from "../../src/api/axios";
import {
  User,
  Settings2,
  Cpu,
  AlertCircle,
  Calendar,
  Heart,
  Zap,
} from "lucide-react-native";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "hardware" | "thresholds"
  >("profile");

  return (
    <View className='flex-1 bg-background'>
      <ScrollView>
        {/* Hero Section */}
        <View className='mb-2 mt-2 relative'>
          <View className='bg-primary/10 py-10 px-6 border border-primary/20 overflow-hidden'>
            <Text className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>
              System
            </Text>
            <Text className='text-2xl font-extrabold text-foreground mb-1'>
              Settings
            </Text>
            <Text className='text-muted-foreground text-sm'>
              Manage your application preferences
            </Text>
          </View>
        </View>

        <View className='px-4 pb-24'>
          {/* Custom Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className='mb-6 mt-2'
            contentContainerStyle={{ gap: 8 }}
          >
            <TabButton
              active={activeTab === "profile"}
              icon={
                <User
                  size={16}
                  color={
                    activeTab === "profile"
                      ? "hsl(173, 50%, 50%)"
                      : "hsl(0, 0%, 50%)"
                  }
                />
              }
              label='Profile'
              onPress={() => setActiveTab("profile")}
            />
            <TabButton
              active={activeTab === "preferences"}
              icon={
                <Settings2
                  size={16}
                  color={
                    activeTab === "preferences"
                      ? "hsl(173, 50%, 50%)"
                      : "hsl(0, 0%, 50%)"
                  }
                />
              }
              label='Preferences'
              onPress={() => setActiveTab("preferences")}
            />
            <TabButton
              active={activeTab === "hardware"}
              icon={
                <Cpu
                  size={16}
                  color={
                    activeTab === "hardware"
                      ? "hsl(173, 50%, 50%)"
                      : "hsl(0, 0%, 50%)"
                  }
                />
              }
              label='Hardware'
              onPress={() => setActiveTab("hardware")}
            />
            <TabButton
              active={activeTab === "thresholds"}
              icon={
                <AlertCircle
                  size={16}
                  color={
                    activeTab === "thresholds"
                      ? "hsl(173, 50%, 50%)"
                      : "hsl(0, 0%, 50%)"
                  }
                />
              }
              label='Thresholds'
              onPress={() => setActiveTab("thresholds")}
            />
          </ScrollView>

          {/* Tab Content */}
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "preferences" && <PreferencesTab />}
          {activeTab === "hardware" && <HardwareTab />}
          {activeTab === "thresholds" && <ThresholdsTab />}
        </View>
      </ScrollView>
    </View>
  );
}

function TabButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-4 py-2.5 rounded-full border ${
        active
          ? "bg-primary/10 border-primary/40"
          : "bg-muted/30 border-border/60"
      }`}
    >
      {icon}
      <Text
        className={`ml-2 text-xs font-bold ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ----------------------------------------------------------------------
// 1. Profile Tab (Working)
// ----------------------------------------------------------------------
function ProfileTab() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone ? String(user.phone) : "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch("/user", { name, email, phone });
      setUser(data.data);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Card className='rounded-xl border border-border'>
      <CardContent className='p-5 pt-5 space-y-5'>
        <View className='flex-row items-center gap-3 mb-2'>
          <View className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
            <User size={20} color='hsl(173, 50%, 50%)' />
          </View>
          <Text className='font-bold text-foreground text-lg'>
            Personal Information
          </Text>
        </View>

        <View>
          <Text className='text-sm font-medium text-foreground mb-2'>
            Full Name
          </Text>
          <Input value={name} onChangeText={setName} />
        </View>

        <View>
          <Text className='text-sm font-medium text-foreground mb-2'>
            Email Address
          </Text>
          <Input
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
          />
        </View>

        <View>
          <Text className='text-sm font-medium text-foreground mb-2'>
            Phone Number
          </Text>
          <Input
            value={phone}
            onChangeText={setPhone}
            keyboardType='phone-pad'
          />
        </View>

        {memberSince ? (
          <View className='flex-row items-center gap-2 mt-2'>
            <Calendar size={14} color='hsl(0, 0%, 50%)' />
            <Text className='text-sm text-muted-foreground'>
              Member since {memberSince}
            </Text>
          </View>
        ) : null}

        <Button className='mt-4 h-12' disabled={loading} onPress={handleUpdate}>
          {loading ? (
            <ActivityIndicator size='small' color='#fff' />
          ) : (
            <Text className='text-primary-foreground font-bold text-base'>
              Update Profile
            </Text>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------
// 2. Alert Thresholds Tab (Working)
// ----------------------------------------------------------------------
function ThresholdsTab() {
  const [formData, setFormData] = useState({
    heartRateMax: "180",
    heartRateMin: "40",
    emgCrampThreshold: "150",
  });
  const [initialData, setInitialData] = useState({
    heartRateMax: "180",
    heartRateMin: "40",
    emgCrampThreshold: "150",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        const settings = data.data;
        if (settings) {
          const loadedData = {
            heartRateMax: String(settings.heartRateMax),
            heartRateMin: String(settings.heartRateMin),
            emgCrampThreshold: String(settings.emgCrampThreshold),
          };
          setFormData(loadedData);
          setInitialData(loadedData);
        }
      } catch (error) {
        console.error("Settings fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const hasChanges =
    formData.heartRateMax !== initialData.heartRateMax ||
    formData.heartRateMin !== initialData.heartRateMin ||
    formData.emgCrampThreshold !== initialData.emgCrampThreshold;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        heartRateMax: Number(formData.heartRateMax),
        heartRateMin: Number(formData.heartRateMin),
        emgCrampThreshold: Number(formData.emgCrampThreshold),
      };
      await api.patch("/settings", payload);
      setInitialData(formData);
      Alert.alert("Success", "Thresholds saved successfully");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
  };

  if (loading) {
    return (
      <View className='py-12 items-center'>
        <ActivityIndicator size='large' color='hsl(173, 50%, 50%)' />
      </View>
    );
  }

  return (
    <Card className='rounded-xl border border-border'>
      <CardContent className='p-5 pt-5 space-y-6'>
        <View className='flex-row items-center gap-3 mb-2'>
          <View className='w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center'>
            <AlertCircle size={20} color='hsl(0, 84%, 60%)' />
          </View>
          <View className='flex-1'>
            <Text className='font-bold text-foreground text-lg leading-tight'>
              Alert Configuration
            </Text>
            <Text className='text-xs text-muted-foreground mt-1'>
              Physiological thresholds that trigger emergency alerts
            </Text>
          </View>
        </View>

        {/* Heart Rate */}
        <View className='space-y-4 pt-2 border-t border-border/50'>
          <View className='flex-row items-center gap-2'>
            <Heart size={16} color='hsl(0, 84%, 60%)' />
            <Text className='text-xs font-bold text-muted-foreground uppercase tracking-wide'>
              Heart Rate
            </Text>
          </View>

          <View className='flex-row gap-4'>
            <View className='flex-1'>
              <Text className='text-xs font-medium text-foreground mb-2'>
                Max HR (bpm)
              </Text>
              <Input
                keyboardType='numeric'
                value={formData.heartRateMax}
                onChangeText={(val) =>
                  setFormData({ ...formData, heartRateMax: val })
                }
              />
            </View>
            <View className='flex-1'>
              <Text className='text-xs font-medium text-foreground mb-2'>
                Min HR (bpm)
              </Text>
              <Input
                keyboardType='numeric'
                value={formData.heartRateMin}
                onChangeText={(val) =>
                  setFormData({ ...formData, heartRateMin: val })
                }
              />
            </View>
          </View>
          <Text className='text-[10px] text-muted-foreground'>
            Triggers when readings fall outside these zones
            (tachycardia/bradycardia)
          </Text>
        </View>

        {/* EMG */}
        <View className='space-y-4 pt-4 border-t border-border/50'>
          <View className='flex-row items-center gap-2'>
            <Zap size={16} color='hsl(45, 93%, 47%)' />
            <Text className='text-xs font-bold text-muted-foreground uppercase tracking-wide'>
              EMG / Muscle Cramp
            </Text>
          </View>

          <View>
            <Text className='text-xs font-medium text-foreground mb-2'>
              EMG Threshold
            </Text>
            <Input
              keyboardType='numeric'
              value={formData.emgCrampThreshold}
              onChangeText={(val) =>
                setFormData({ ...formData, emgCrampThreshold: val })
              }
            />
          </View>
          <Text className='text-[10px] text-muted-foreground'>
            Triggers when reading exceeds this value, indicating possible severe
            cramping.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className='flex-row gap-3 pt-4 border-t border-border/50'>
          <Button
            className='flex-1 h-12'
            disabled={!hasChanges || saving}
            onPress={handleSave}
          >
            {saving ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Text className='text-primary-foreground font-bold'>Save</Text>
            )}
          </Button>
          <Button
            variant='outline'
            className='flex-1 h-12 shadow-none'
            disabled={!hasChanges}
            onPress={handleReset}
          >
            <Text className='text-foreground font-bold'>Reset</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------
// 3. Preferences Tab (Placeholder)
// ----------------------------------------------------------------------
function PreferencesTab() {
  const [autoPublish, setAutoPublish] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);

  return (
    <Card className='rounded-xl border border-border'>
      <CardContent className='p-5 pt-5 space-y-6'>
        <View className='mb-2'>
          <Text className='font-bold text-foreground text-lg'>
            Event Preferences
          </Text>
          <Text className='text-xs text-muted-foreground mt-1'>
            Configure default event settings
          </Text>
        </View>

        <View className='flex-row items-center justify-between pt-2'>
          <View className='flex-1 pr-4'>
            <Text className='font-medium text-foreground'>
              Auto-publish Results
            </Text>
            <Text className='text-[10px] text-muted-foreground mt-0.5'>
              Automatically publish results after race
            </Text>
          </View>
          <Switch
            value={autoPublish}
            onValueChange={setAutoPublish}
            trackColor={{ true: "hsl(173, 50%, 50%)" }}
          />
        </View>

        <View className='flex-row items-center justify-between pt-4 border-t border-border/50'>
          <View className='flex-1 pr-4'>
            <Text className='font-medium text-foreground'>
              Email Notifications
            </Text>
            <Text className='text-[10px] text-muted-foreground mt-0.5'>
              Send email updates to participants
            </Text>
          </View>
          <Switch
            value={emailNotif}
            onValueChange={setEmailNotif}
            trackColor={{ true: "hsl(173, 50%, 50%)" }}
          />
        </View>

        <View className='flex-row items-center justify-between pt-4 border-t border-border/50'>
          <View className='flex-1 pr-4'>
            <Text className='font-medium text-foreground'>Auto-Assignment</Text>
            <Text className='text-[10px] text-muted-foreground mt-0.5'>
              Automatically assign RFID tags
            </Text>
          </View>
          <Switch
            value={autoAssign}
            onValueChange={setAutoAssign}
            trackColor={{ true: "hsl(173, 50%, 50%)" }}
          />
        </View>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------
// 4. Hardware Tab (Placeholder)
// ----------------------------------------------------------------------
function HardwareTab() {
  return (
    <Card className='rounded-xl border border-border'>
      <CardContent className='p-5 pt-5 space-y-5'>
        <View className='mb-2'>
          <Text className='font-bold text-foreground text-lg'>
            Hardware Config
          </Text>
          <Text className='text-xs text-muted-foreground mt-1'>
            Manage RFID and tracking hardware settings
          </Text>
        </View>

        <View>
          <Text className='text-sm font-medium text-foreground mb-2'>
            RFID Tag Prefix
          </Text>
          <Input defaultValue='LS-' />
        </View>

        <View>
          <Text className='text-sm font-medium text-foreground mb-2'>
            Checkpoint Check Interval (sec)
          </Text>
          <Input defaultValue='5' keyboardType='numeric' />
        </View>

        <Button className='mt-4 h-12'>
          <Text className='text-primary-foreground font-bold'>
            Update Configuration
          </Text>
        </Button>
      </CardContent>
    </Card>
  );
}
