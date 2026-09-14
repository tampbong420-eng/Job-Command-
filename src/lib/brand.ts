export const PRODUCT_LOGO = "/job-command-mark.jpg";

export const COMPANY_PROFILE = {
  name: "Top Gun Painting",
  city: "Hot Springs, AR",
};

export type WorkspaceBrand = {
  productLogo: string;
  companyLogo: string | null;
  companyName: string;
  companyCity: string;
};

export function getWorkspaceBrand(): WorkspaceBrand {
  return {
    productLogo: PRODUCT_LOGO,
    companyLogo: null,
    companyName: COMPANY_PROFILE.name,
    companyCity: COMPANY_PROFILE.city,
  };
}
