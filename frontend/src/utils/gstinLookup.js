export function normaliseGstin(value) {
  return value.replace(/\s/g, '').toUpperCase()
}

export function applyGstinToProfile(profile, details) {
  return {
    ...profile,
    gstin: details.gstin,
    businessName: details.legalName || details.tradeName || profile.businessName,
    tradeName: details.tradeName || profile.tradeName,
    registrationType: details.registrationType || profile.registrationType,
    state: details.state || profile.state,
    stateCode: details.stateCode || profile.stateCode,
    address: details.address || profile.address,
  }
}

export function applyGstinToContact(contact, details) {
  return {
    ...contact,
    gstin: details.gstin,
    name: details.tradeName || details.legalName || contact.name,
    stateCode: details.stateCode || contact.stateCode,
    address: details.address || contact.address,
  }
}
