import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Package,
} from "lucide-react";
import { cn, getFullImageUrl } from "@/lib/utils";
import { useLocation } from "wouter";

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

export default function ProductManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [imageCacheBuster, setImageCacheBuster] = useState(Date.now());
  const { data: products = [], isLoading: productsLoading, error } = useQuery({
    queryKey: ["/api/vendor/products"],
    queryFn: async () => {
      try {
        console.log("Fetching vendor products...");
        const user = JSON.parse(localStorage.getItem("sweetspot_user") || "{}");
        const token = user?.token;
        const response = await fetch('http://localhost:3001/api/vendor/products', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch products');
        }
        const data = await response.json();
        console.log("Vendor products response:", data);
        return data;
      } catch (err) {
        if (err.message && err.message.toLowerCase().includes('invalid token')) {
          localStorage.removeItem('sweetspot_user');
          document.cookie = 'session_token=; Max-Age=0; path=/;';
          window.location.href = '/login';
        }
        console.error("Error in queryFn:", err);
        throw err;
      }
    },
    onError: (err) => {
      console.error("Error in useQuery onError:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load products. Please refresh the page.",
        variant: "destructive",
      });
    },
  });
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ["/api/categories"],
  });
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryId: "",
      stock: "",
      prepTimeMinutes: "",
      tags: "",
      dietary: [],
      isActive: true,
    },
  });
  const createProductMutation = useMutation({
    mutationFn: async (data) => {
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
      const response = await apiRequest("POST", "http://localhost:3001/api/products", formData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      setImageCacheBuster(Date.now());
      toast({
        title: "Product created",
        description: "Your product has been created successfully.",
      });
      setIsAddDialogOpen(false);
      form.reset();
      setSelectedImage(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }) => {
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
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      setImageCacheBuster(Date.now());
      toast({
        title: "Product updated",
        description: "Your product has been updated successfully.",
      });
      setEditingProduct(null);
      form.reset();
      setSelectedImage(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });
  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      toast({
        title: "Product deleted",
        description: "Your product has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });
  const sortedFilteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.isActive) ||
        (statusFilter === "inactive" && !product.isActive);
      const catId = product.categoryId?._id || product.categoryId;
      const matchesCategory =
        categoryFilter === "all" || catId === categoryFilter;
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "in" && product.stock > 0) ||
        (availabilityFilter === "out" && product.stock === 0);
      return (
        matchesSearch && matchesStatus && matchesCategory && matchesAvailability
      );
    })
    .sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      if (sortOption === "oldest") return new Date(a.updatedAt) - new Date(b.updatedAt);
      // Default: newest
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  const totalPages = Math.ceil(sortedFilteredProducts.length / pageSize);
  const paginatedProducts = sortedFilteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const handleEdit = (product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      categoryId: product.categoryId?._id?.toString() || product.categoryId?.toString() || "",
      stock: product.stock.toString(),
      prepTimeMinutes: product.prepTimeMinutes?.toString(),
      tags: product.tags?.join(", "),
      dietary: product.dietary || [],
      isActive: product.isActive,
    });
    setSelectedImage(null);
  };
  const handleDelete = (product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProductMutation.mutate(product._id);
    }
  };
  const onSubmit = (data) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, data });
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
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const addCategoryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/categories", {
        name: newCategoryName,
        description: newCategoryDesc,
      });
      return res;
    },
    onSuccess: () => {
      setIsAddCategoryOpen(false);
      setNewCategoryName("");
      setNewCategoryDesc("");
      refetchCategories();
      toast({ title: "Category added!" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Check if we're on the /new route and auto-open dialog
  useEffect(() => {
    if (location === "/vendor/products/new") {
      setIsAddDialogOpen(true);
      // Redirect to main products page to clean up URL
      setLocation("/vendor/products");
    }
  }, [location, setLocation]);

  return (
    <div className="space-y-8">
      {/* Header/Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">My Products</h2>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">Failed to load products. Please try again later.</span>
            </div>
          )}
          {!productsLoading && products.length === 0 && !error && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new product.</p>
              <div className="mt-6">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters/Sort/Search */}
      <Card className="border-0 shadow-lg bg-card/50">
        <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="in">In Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Published</SelectItem>
              <SelectItem value="inactive">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="border-pink-400 text-pink-600 hover:bg-pink-50"
            onClick={() => setIsAddCategoryOpen(true)}
            type="button"
          >
            + Add Category
          </Button>
        </CardContent>
      </Card>

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
                  {lowStockProducts.length} products have 5 or fewer items in
                  stock
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
        ) : paginatedProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          paginatedProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              showVendorActions
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="mx-4 text-lg font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen || !!editingProduct} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) setEditingProduct(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>This dialog allows you to add or edit a product.</DialogDescription>
          </DialogHeader>
          <ProductForm
            form={form}
            onSubmit={onSubmit}
            categories={categories}
            dietaryOptions={dietaryOptions}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            isLoading={createProductMutation.isPending || updateProductMutation.isPending}
            currentImageUrl={editingProduct?.imageUrl}
            imageCacheBuster={imageCacheBuster}
          />
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>This dialog allows you to add a new category.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              addCategoryMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Category Name</label>
              <Input
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={newCategoryDesc}
                onChange={e => setNewCategoryDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-sweet text-white" disabled={addCategoryMutation.isPending}>
                {addCategoryMutation.isPending ? "Adding..." : "Add Category"}
              </Button>
            </div>
          </form>
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
  currentImageUrl,
  imageCacheBuster,
}) {
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Show current image if editing and no new image selected */}
        {currentImageUrl && !selectedImage && (
          <div className="mb-4 text-center">
            <img
              src={getFullImageUrl(`${currentImageUrl}${imageCacheBuster ? `?t=${imageCacheBuster}` : ""}`)}
              alt="Current product"
              className="mx-auto h-32 object-contain rounded-lg border"
              style={{ maxWidth: 160 }}
            />
            <div className="text-xs text-muted-foreground mt-1">Current Image</div>
          </div>
        )}
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
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="12.99"
                    {...field}
                  />
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
              <FormItem className="flex-1">
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value || "all"}
                  onValueChange={val => field.onChange(val === "all" ? undefined : val)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id || cat.id} value={cat._id || cat.id}>
                        {cat.name}
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
                                ? field.onChange([
                                    ...(field.value || []),
                                    option,
                                  ])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== option,
                                    ),
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
                <FormLabel>Active Product</FormLabel>
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
