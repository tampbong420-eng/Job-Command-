export const PRODUCT_LOGO = "/job-command-mark.jpg";

export type WorkspaceBrand = {
  productLogo: string;
  companyLogo: string | null;
};

export function getWorkspaceBrand(): WorkspaceBrand {
  return {
    productLogo: PRODUCT_LOGO,
    // Company logo is chosen in settings. That screen is not built yet.
    companyLogo: null,
  };
}
