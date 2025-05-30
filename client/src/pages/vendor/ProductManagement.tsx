import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ProductCard from "@/components/ui/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/SkeletonLoader";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Upload,
  AlertCircle,
  Package
} from "lucide-react";
import type { Product } from "@/types";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  categoryId: z.string().optional(),
  stock: z.string().min(1, "Stock is required"),
  prepTimeMinutes: z.string().optional(),
  tags: z.string().optional(),
  dietary: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/vendor/products"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      dietary: [],
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === "dietary" && Array.isArray(value)) {
          formData.append(key, value.join(","));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await apiRequest("POST", "/api/products", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      toast({
        title: "Product created",
        description: "Your product has been created successfully.",
      });
      setIsAddDialogOpen(false);
      form.reset();
      setSelectedImage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormData }) => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === "dietary" && Array.isArray(value)) {
          formData.append(key, value.join(","));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await apiRequest("PUT", `/api/products/${id}`, formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      toast({
        title: "Product updated",
        description: "Your product has been updated successfully.",
      });
      setEditingProduct(null);
      form.reset();
      setSelectedImage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      toast({
        title: "Product deleted",
        description: "Your product has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && product.isActive) ||
                         (statusFilter === "inactive" && !product.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      categoryId: product.categoryId?.toString(),
      stock: product.stock.toString(),
      prepTimeMinutes: product.prepTimeMinutes?.toString(),
      tags: product.tags?.join(", "),
      dietary: product.dietary || [],
      isActive: product.isActive,
    });
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const dietaryOptions = [
    "vegan",
    "gluten-free",
    "sugar-free",
    "keto",
    "dairy-free",
    "nut-free",
  ];

  const lowStockProducts = products.filter((p: Product) => p.stock <= 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground">Manage your dessert inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-sweet text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              form={form}
              onSubmit={onSubmit}
              categories={categories}
              dietaryOptions={dietaryOptions}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              isLoading={createProductMutation.isPending || updateProductMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-medium text-orange-800 dark:text-orange-200">
                  Low Stock Alert
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {lowStockProducts.length} products have 5 or fewer items in stock
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-card/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredProducts.length} products found
          </p>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search criteria" 
                  : "Add your first product to get started"}
              </p>
            </div>
            {!searchQuery && statusFilter === "all" && (
              <Button 
                className="gradient-sweet text-white"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                showVendorActions
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Product Dialog */}
      <Dialog 
        open={!!editingProduct} 
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            form={form}
            onSubmit={onSubmit}
            categories={categories}
            dietaryOptions={dietaryOptions}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            isLoading={updateProductMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Product Form Component
function ProductForm({
  form,
  onSubmit,
  categories,
  dietaryOptions,
  selectedImage,
  setSelectedImage,
  isLoading,
}: {
  form: any;
  onSubmit: (data: ProductFormData) => void;
  categories: any[];
  dietaryOptions: string[];
  selectedImage: File | null;
  setSelectedImage: (file: File | null) => void;
  isLoading: boolean;
}) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Chocolate Lava Cake" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="12.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your delicious dessert..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="25" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prepTimeMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (min)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="chocolate, dessert, premium" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dietary"
          render={() => (
            <FormItem>
              <FormLabel>Dietary Options</FormLabel>
              <div className="grid grid-cols-3 gap-3">
                {dietaryOptions.map((option) => (
                  <FormField
                    key={option}
                    control={form.control}
                    name="dietary"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), option])
                                : field.onChange(
                                    field.value?.filter((value) => value !== option)
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal capitalize">
                          {option}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Product Image</FormLabel>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload a high-quality image of your dessert
            </p>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="max-w-xs mx-auto"
            />
            {selectedImage && (
              <p className="text-sm text-green-600 mt-2">
                Selected: {selectedImage.name}
              </p>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Active Product
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  This product will be visible to customers
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex space-x-4">
          <Button
            type="submit"
            className="flex-1 gradient-sweet text-white"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
