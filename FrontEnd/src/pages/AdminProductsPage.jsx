import { useAdminProductsPage } from "../hooks/useAdminProductsPage.js";
import { AdminProductsTableSkeleton } from "../components/LoadingSkeletons.jsx";
import { IK_PRESETS, imageKitOptimizedUrl } from "../lib/imageKitUrl.js";
import { PackageIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { formatPrice } from "../utils/format.js";
import { AdminProductForm } from "../components/AdminProductForm.jsx";
import { Navigate } from "react-router";
import HomeCats from "../components/HomeCats.jsx";

function AdminProductsPage() {
  const {
    getToken,
    meData,
    modalOpen,
    setModalOpen,
    editing,
    setEditing,
    products,
    isLoading,
    saveMutation,
    deleteMutation,
    categories , 
    setCategory, 
    categoryChipsLoading ,
    categoryFilter
  } = useAdminProductsPage();

  if (meData && meData.user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  function handleDeleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}" permanently?`)) return;

    deleteMutation.mutate(product.id);
  }

  return (
    <div className="min-w-0 text-left">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 min-[491px]:flex-row min-[491px]:items-center">
        <div className="flex min-w-0 items-center gap-2">
          <PackageIcon className="size-7 shrink-0 text-secondary sm:size-8" aria-hidden />
          <div>
            <h1 className="text-xl font-bold text-base-content sm:text-2xl">Products</h1>
            <p className="text-sm text-base-content/60">Manage catalog (admin only).</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm w-full gap-2 min-[491px]:w-auto"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <PlusIcon className="size-4" aria-hidden />
          Add product
        </button>
      </div>
      <div>
        <HomeCats
            categoryFilter={categoryFilter}
            setCategory={setCategory}
            categories={categories}
            categoryChipsLoading={categoryChipsLoading}
      />
      </div>

      {isLoading ? (
        <AdminProductsTableSkeleton />
      ) : (
        <div className="admin-products-table overflow-hidden rounded-box border border-base-300 bg-base-100">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="w-24">Preview</th>
                <th>Name</th>
                <th>Category</th>
                <th>Slug</th>
                <th>Price</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td data-label="Preview" className="align-middle">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-base-300 bg-base-200 shadow-sm ring-1 ring-base-300/50 sm:h-18 sm:w-18">
                      {p.imageUrl ? (
                        <img
                          src={imageKitOptimizedUrl(p.imageUrl, IK_PRESETS.adminThumb)}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-base-300 to-base-200">
                          <PackageIcon className="size-6 text-base-content/35" aria-hidden />
                        </div>
                      )}
                    </div>
                  </td>
                  <td data-label="Name" className="font-medium">{p.name}</td>
                  <td data-label="Category">
                    <span className="badge badge-ghost badge-sm">{p.category ?? "-"}</span>
                  </td>
                  <td data-label="Slug" className="break-all font-mono text-sm opacity-80">{p.slug}</td>
                  <td data-label="Price">{formatPrice(p.priceCents, p.currency)}</td>
                  <td data-label="Active">
                    {p.active ? (
                      <span className="badge badge-success badge-sm">yes</span>
                    ) : (
                      <span className="badge badge-ghost badge-sm">no</span>
                    )}
                  </td>
                  <td data-label="Actions">
                    <div className="flex flex-wrap items-center justify-end gap-1 max-[640px]:justify-start">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs gap-1"
                        onClick={() => {
                          setEditing(p);
                          setModalOpen(true);
                        }}
                      >
                        <PencilIcon className="size-3" aria-hidden />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-ghost btn-xs gap-1 text-error hover:bg-error/10"
                        disabled={deleteMutation.isPending && deleteMutation.variables === p.id}
                        onClick={() => handleDeleteProduct(p)}
                      >
                        {deleteMutation.isPending && deleteMutation.variables === p.id ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <Trash2Icon className="size-3" aria-hidden />
                        )}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <dialog className={`modal ${modalOpen ? "modal-open" : ""}`}>
        <div className="modal-box w-[calc(100vw-2rem)] max-w-lg p-4 sm:p-6">
          <h3 className="text-lg font-bold">{editing ? "Edit product" : "New product"}</h3>

          <AdminProductForm
            key={editing?.id ?? "new"}
            initial={editing}
            saving={saveMutation.isPending}
            error={saveMutation.isError}
            getToken={getToken}
            onCancel={() => {
              setModalOpen(false);
              setEditing(null);
            }}
            onSubmit={(body) => saveMutation.mutate({ body, id: editing?.id })}
          />
        </div>

        <button
          type="button"
          className="modal-backdrop bg-neutral/50"
          onClick={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </dialog>
    </div>
  );
}

export default AdminProductsPage;