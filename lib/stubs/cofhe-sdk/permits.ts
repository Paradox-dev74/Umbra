/** SSR stub — real @cofhe/sdk/permits loads in the browser */
export const PermitUtils = {
  createSharingAndSign: async () => {
    throw new Error("CoFHE permits require browser wallet");
  },
};

export const setPermit = () => {};
export const setActivePermitHash = () => {};
export const ValidationUtils = { isExpired: () => true, isValid: () => ({ valid: false }) };

export const permitStore = {
  getPermits: () => ({}),
};
