import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, CheckCircle2, ChevronRight } from "lucide-react-native";
import { Input } from "../ui/Input";
import api from "../../api/axios";

const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const RELATIONSHIPS = [
  "Parent",
  "Guardian",
  "Sibling",
  "Friend",
  "Spouse",
  "Other",
];

export function RegisterEventModal({
  event,
  visible,
  onClose,
  onSuccess,
}: {
  event: any;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [raceCategoryId, setRaceCategoryId] = useState<string>("");
  const [shirtSize, setShirtSize] = useState<string>("M");
  
  const [ecName, setEcName] = useState("");
  const [ecPhone, setEcPhone] = useState("");
  const [ecRelationship, setEcRelationship] = useState("Parent");

  const [medConditions, setMedConditions] = useState("");
  const [medAllergies, setMedAllergies] = useState("");
  const [medMedications, setMedMedications] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Picker States
  const [activePicker, setActivePicker] = useState<"category" | "shirt" | "relationship" | null>(null);

  const handleSubmit = async () => {
    if (!raceCategoryId) {
      Alert.alert("Missing Field", "Please select a Race Category.");
      return;
    }
    if (!ecName.trim() || !ecPhone.trim()) {
      Alert.alert("Missing Fields", "Emergency Contact Name and Phone are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        raceCategoryId,
        shirtSize,
        emergencyContact: {
          name: ecName,
          phone: ecPhone,
          relationship: ecRelationship,
        },
        medicalInfo: {
          conditions: medConditions,
          allergies: medAllergies,
          medications: medMedications,
        },
      };

      await api.post(`/event/${event._id}/register`, payload);
      Alert.alert(
        "Registration Successful",
        "Proceed to payment to confirm your slot."
      );
      onSuccess();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || "An error occurred while registering."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryName = (id: string) => {
    const cat = event?.raceCategories?.find((c: any) => c._id === id);
    if (!cat) return "Select category";
    return `${cat.name} (${cat.distanceKm}K)`;
  };

  return (
    <Modal visible={visible} transparent={true} animationType='slide'>
      <View className='flex-1 justify-end bg-black/40'>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className='flex-1 justify-end'
        >
          <View className='bg-background rounded-t-3xl overflow-hidden border-t border-border max-h-[90%]'>
            {/* Header */}
            <View className='p-6 border-b border-border flex-row items-center justify-between'>
              <View className='flex-1 mr-4'>
                <Text className='font-extrabold text-foreground text-xl mb-1' numberOfLines={1}>
                  Register for {event?.name}
                </Text>
                <Text className='text-muted-foreground text-sm'>
                  Complete your registration details below.
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className='p-2 bg-muted rounded-full'
              >
                <X size={20} color='hsl(0, 0%, 50%)' />
              </TouchableOpacity>
            </View>

            <ScrollView className='p-6' showsVerticalScrollIndicator={false}>
              <View className='space-y-6'>
                
                {/* Race Category Picker */}
                <View>
                  <Text className='text-foreground font-semibold mb-2 ml-1'>
                    Race Category
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActivePicker("category")}
                    className='bg-muted/30 border border-border/60 h-14 px-4 rounded-xl flex-row items-center justify-between'
                  >
                    <Text className={`font-medium ${raceCategoryId ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {getCategoryName(raceCategoryId)}
                    </Text>
                    <ChevronRight size={18} color='hsl(0, 0%, 50%)' />
                  </TouchableOpacity>
                </View>

                {/* Shirt Size Picker */}
                <View className='mt-4'>
                  <Text className='text-foreground font-semibold mb-2 ml-1'>
                    Shirt Size
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActivePicker("shirt")}
                    className='bg-muted/30 border border-border/60 h-14 px-4 rounded-xl flex-row items-center justify-between'
                  >
                    <Text className='font-medium text-foreground'>
                      {shirtSize}
                    </Text>
                    <ChevronRight size={18} color='hsl(0, 0%, 50%)' />
                  </TouchableOpacity>
                </View>

                {/* Emergency Contact */}
                <View className='mt-6 border-t border-border/50 pt-6'>
                  <Text className='font-bold text-foreground text-lg mb-4'>
                    Emergency Contact
                  </Text>

                  <View className='space-y-4'>
                    <View>
                      <Text className='text-muted-foreground text-xs font-semibold mb-1 ml-1 uppercase tracking-wider'>
                        Name
                      </Text>
                      <Input
                        placeholder='Full name'
                        value={ecName}
                        onChangeText={setEcName}
                        className='bg-muted/30 border-border/60 h-14 px-4 rounded-xl text-foreground font-medium'
                      />
                    </View>
                    <View className='mt-4'>
                      <Text className='text-muted-foreground text-xs font-semibold mb-1 ml-1 uppercase tracking-wider'>
                        Phone
                      </Text>
                      <Input
                        placeholder='+63...'
                        value={ecPhone}
                        onChangeText={setEcPhone}
                        keyboardType="phone-pad"
                        className='bg-muted/30 border-border/60 h-14 px-4 rounded-xl text-foreground font-medium'
                      />
                    </View>
                    <View className='mt-4'>
                      <Text className='text-muted-foreground text-xs font-semibold mb-1 ml-1 uppercase tracking-wider'>
                        Relationship
                      </Text>
                      <TouchableOpacity
                        onPress={() => setActivePicker("relationship")}
                        className='bg-muted/30 border border-border/60 h-14 px-4 rounded-xl flex-row items-center justify-between'
                      >
                        <Text className='font-medium text-foreground'>
                          {ecRelationship}
                        </Text>
                        <ChevronRight size={18} color='hsl(0, 0%, 50%)' />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Medical Info */}
                <View className='mt-6 border-t border-border/50 pt-6 mb-8'>
                  <Text className='font-bold text-foreground text-lg mb-1'>
                    Medical Info <Text className='text-muted-foreground text-sm font-normal'>(Optional)</Text>
                  </Text>

                  <View className='space-y-4 mt-3'>
                    <View>
                      <Text className='text-muted-foreground text-xs font-semibold mb-1 ml-1 uppercase tracking-wider'>
                        Conditions
                      </Text>
                      <Input
                        placeholder='Asthma, heart condition...'
                        value={medConditions}
                        onChangeText={setMedConditions}
                        className='bg-muted/30 border-border/60 h-14 px-4 rounded-xl text-foreground font-medium'
                      />
                    </View>
                    <View className='mt-4'>
                      <Text className='text-muted-foreground text-xs font-semibold mb-1 ml-1 uppercase tracking-wider'>
                        Allergies
                      </Text>
                      <Input
                        placeholder='Food, medication...'
                        value={medAllergies}
                        onChangeText={setMedAllergies}
                        className='bg-muted/30 border-border/60 h-14 px-4 rounded-xl text-foreground font-medium'
                      />
                    </View>
                    <View className='mt-4'>
                      <Text className='text-muted-foreground text-xs font-semibold mb-1 ml-1 uppercase tracking-wider'>
                        Medications
                      </Text>
                      <Input
                        placeholder='Maintenance meds...'
                        value={medMedications}
                        onChangeText={setMedMedications}
                        className='bg-muted/30 border-border/60 h-14 px-4 rounded-xl text-foreground font-medium'
                      />
                    </View>
                  </View>
                </View>

              </View>
            </ScrollView>

            <View className='p-6 border-t border-border bg-background'>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl flex-row items-center justify-center ${isSubmitting ? "bg-primary/50" : "bg-primary"}`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color='white' size='small' />
                ) : (
                  <Text className='font-bold text-white text-base'>
                    Submit Registration
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Reusable Picker Modal */}
      {activePicker && (
        <Modal visible={true} transparent={true} animationType='fade'>
          <View className='flex-1 justify-end bg-black/60'>
            <View className='bg-background rounded-t-3xl border-t border-border max-h-[70%]'>
              <View className='p-4 border-b border-border flex-row items-center justify-between bg-muted/10'>
                <Text className='font-bold text-foreground text-lg capitalize'>
                  Select {activePicker}
                </Text>
                <TouchableOpacity onPress={() => setActivePicker(null)} className='p-2 bg-muted rounded-full'>
                  <X size={20} color='hsl(0, 0%, 50%)' />
                </TouchableOpacity>
              </View>
              
              <ScrollView className='p-4'>
                {activePicker === "category" && event?.raceCategories?.map((cat: any) => {
                  const isSelected = raceCategoryId === cat._id;
                  return (
                    <TouchableOpacity
                      key={cat._id}
                      onPress={() => {
                        setRaceCategoryId(cat._id);
                        setActivePicker(null);
                      }}
                      className={`p-4 border-b border-border/50 flex-row items-center justify-between ${isSelected ? 'bg-primary/10' : ''}`}
                    >
                      <View>
                        <Text className={`font-bold text-base ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {cat.name}
                        </Text>
                        <Text className='text-xs text-muted-foreground mt-1'>
                          Distance: {cat.distanceKm}K
                        </Text>
                      </View>
                      {isSelected && <CheckCircle2 size={20} color='hsl(173, 50%, 50%)' />}
                    </TouchableOpacity>
                  );
                })}

                {activePicker === "shirt" && SHIRT_SIZES.map((size) => {
                  const isSelected = shirtSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => {
                        setShirtSize(size);
                        setActivePicker(null);
                      }}
                      className={`p-4 border-b border-border/50 flex-row items-center justify-between ${isSelected ? 'bg-primary/10' : ''}`}
                    >
                      <Text className={`font-bold text-base ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {size}
                      </Text>
                      {isSelected && <CheckCircle2 size={20} color='hsl(173, 50%, 50%)' />}
                    </TouchableOpacity>
                  );
                })}

                {activePicker === "relationship" && RELATIONSHIPS.map((rel) => {
                  const isSelected = ecRelationship === rel;
                  return (
                    <TouchableOpacity
                      key={rel}
                      onPress={() => {
                        setEcRelationship(rel);
                        setActivePicker(null);
                      }}
                      className={`p-4 border-b border-border/50 flex-row items-center justify-between ${isSelected ? 'bg-primary/10' : ''}`}
                    >
                      <Text className={`font-bold text-base ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {rel}
                      </Text>
                      {isSelected && <CheckCircle2 size={20} color='hsl(173, 50%, 50%)' />}
                    </TouchableOpacity>
                  );
                })}
                <View className='h-8' />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}
