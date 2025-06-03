import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  Settings as SettingsIcon,
  User,
  Store,
  CreditCard,
  Bell,
  Shield,
  Upload,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
});
const storeSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeDescription: z.string().optional(),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
  deliveryRadius: z.string().optional(),
  minimumOrder: z.string().optional(),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function VendorSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef();
  // Mock vendor settings data (in real app, this would come from API)
  const { data: vendorSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/vendor/settings"],
    queryFn: () =>
      Promise.resolve({
        storeName: "Sweet Dreams Bakery",
        storeDescription:
          "Artisan desserts made with love and the finest ingredients",
        storeAddress: "123 Baker Street, Sweet City, SC 12345",
        storePhone: "(555) 123-4567",
        deliveryRadius: "10",
        minimumOrder: "25.00",
        emailNewOrders: true,
        emailOrderUpdates: true,
        emailLowStock: true,
        emailCustomerReviews: false,
        pushNotifications: true,
        smsNotifications: false,
        bankAccount: "**** **** **** 1234",
        taxId: "**-***7890",
        businessLicense: "BL-2024-001234",
      }),
  });
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });
  const storeForm = useForm({
    resolver: zodResolver(storeSchema),
    defaultValues: vendorSettings
      ? {
          storeName: vendorSettings.storeName,
          storeDescription: vendorSettings.storeDescription,
          storeAddress: vendorSettings.storeAddress,
          storePhone: vendorSettings.storePhone,
          deliveryRadius: vendorSettings.deliveryRadius,
          minimumOrder: vendorSettings.minimumOrder,
        }
      : {},
  });
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const body = new FormData();
      body.append("firstName", data.firstName);
      body.append("lastName", data.lastName);
      body.append("email", data.email);
      if (newPhoto) {
        body.append("profileImage", newPhoto);
      }
      return await apiRequest("PUT", "/api/vendor/profile", body);
    },
    onSuccess: (updatedUser) => {
      setNewPhoto(null);
      setPhotoPreview("");
      // Update localStorage with new user info
      const oldUser = JSON.parse(localStorage.getItem("sweetspot_user") || "{}");
      const newUser = {
        ...oldUser,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        profileImageUrl: updatedUser.profileImageUrl,
      };
      localStorage.setItem("sweetspot_user", JSON.stringify(newUser));
      window.location.reload();
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
  const updateStoreMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("PUT", "/api/vendor/store", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/settings"] });
      toast({
        title: "Store settings updated",
        description: "Your store settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update store settings",
        variant: "destructive",
      });
    },
  });
  const updatePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("PUT", "/api/vendor/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    try {
      await apiRequest("DELETE", "/api/account");
      localStorage.removeItem("sweetspot_user");
      window.location.href = "/login";
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete account",
        variant: "destructive",
      });
    }
  };
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  const getInitials = () => {
    return (
      `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
      "V"
    );
  };
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vendor Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and store preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-0 shadow-lg bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={photoPreview || (user && user.profileImageUrl) || ""} />
                  <AvatarFallback className="gradient-sweet text-white text-2xl">
                    {user ? getInitials() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="font-semibold">Profile Photo</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a professional photo that represents your bakery
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handlePhotoChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit((data) =>
                    updateProfileMutation.mutate(data),
                  )}
                >
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={user ? field.value : ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={user ? field.value : ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mb-6">
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} value={user ? field.value : ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="gradient-sweet text-white"
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending
                      ? "Saving..."
                      : "Save Profile"}
                  </Button>
                </form>
              </Form>
              <Separator />
              <Button
                variant="destructive"
                className="w-full mt-4"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
