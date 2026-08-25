const User = require('../models/User');

/**
 * Intelligent Lead Assignment Engine with TL Lead Overflow Rule
 * 1. Admin Pool -> Distribute leads among active TLs via Round-Robin
 * 2. Within each TL -> Assign equal quotas to downstream HRs matching language preference
 * 3. Parity Remainder / Excess Leads -> Left in TL Overflow Pool (assigned_hr = null) for TL Self-Assignment
 */

let tlPointer = 0;
const hrPointers = {}; // Map of tlId_language -> pointer

const assignLeads = async (leadsData) => {
  if (!leadsData || leadsData.length === 0) return [];

  // Fetch all TLs sorted by creation date
  const tls = await User.find({ role: 'TL' }).sort({ createdAt: 1 });

  if (!tls || tls.length === 0) {
    // If no TLs in system, return leads with null assignments
    return leadsData.map(lead => ({
      ...lead,
      assigned_tl: null,
      assigned_hr: null,
    }));
  }

  // Fetch all HRs
  const hrUsers = await User.find({ role: 'HR' }).sort({ createdAt: 1 });

  // Map downstream HRs by TL ID
  const hrByTlMap = {};
  hrUsers.forEach(hr => {
    if (hr.tl_id) {
      const tlIdStr = hr.tl_id.toString();
      if (!hrByTlMap[tlIdStr]) hrByTlMap[tlIdStr] = [];
      hrByTlMap[tlIdStr].push(hr);
    }
  });

  // Step 1: Assign each lead to a TL via round robin and maintain input order indexing
  const indexedLeadsWithTl = leadsData.map((lead, index) => {
    const selectedTl = tls[tlPointer % tls.length];
    tlPointer++;
    return {
      index,
      rawLead: lead,
      selectedTl,
    };
  });

  // Group leads by TL ID
  const leadsByTl = {};
  indexedLeadsWithTl.forEach(item => {
    const tlIdStr = item.selectedTl._id.toString();
    if (!leadsByTl[tlIdStr]) leadsByTl[tlIdStr] = [];
    leadsByTl[tlIdStr].push(item);
  });

  const finalAssignedLeads = new Array(leadsData.length);

  // Step 2: Process leads for each TL
  for (const tlIdStr of Object.keys(leadsByTl)) {
    const tlLeadItems = leadsByTl[tlIdStr];
    const downstreamHrs = hrByTlMap[tlIdStr] || [];

    // Group leads by language for language matching
    const leadsByLang = {};
    tlLeadItems.forEach(item => {
      const lang = (item.rawLead.language || 'English').toLowerCase();
      if (!leadsByLang[lang]) leadsByLang[lang] = [];
      leadsByLang[lang].push(item);
    });

    for (const lang of Object.keys(leadsByLang)) {
      const langItems = leadsByLang[lang];
      const matchingHrs = downstreamHrs.filter(hr =>
        hr.languagesSpoken &&
        hr.languagesSpoken.some(l => l.toLowerCase() === lang)
      );

      const nHrs = matchingHrs.length;
      const nLeads = langItems.length;

      if (nHrs === 0) {
        // No matching HRs: all leads go to TL Overflow Pool
        langItems.forEach(item => {
          finalAssignedLeads[item.index] = {
            ...item.rawLead,
            assigned_tl: item.selectedTl._id,
            assigned_hr: null,
          };
        });
      } else {
        // Calculate equal quota per HR and excess remainder for TL overflow
        const hrQuotaPerMember = Math.floor(nLeads / nHrs);
        const totalHrAllocated = hrQuotaPerMember * nHrs;

        const key = `${tlIdStr}_${lang}`;
        if (hrPointers[key] === undefined) hrPointers[key] = 0;

        // Assign equal quota to HRs using round robin
        for (let i = 0; i < totalHrAllocated; i++) {
          const item = langItems[i];
          const selectedHr = matchingHrs[hrPointers[key] % matchingHrs.length];
          hrPointers[key]++;

          finalAssignedLeads[item.index] = {
            ...item.rawLead,
            assigned_tl: item.selectedTl._id,
            assigned_hr: selectedHr._id,
          };
        }

        // Remaining excess leads (nLeads - totalHrAllocated) go to TL Lead Overflow Pool (assigned_hr = null)
        for (let i = totalHrAllocated; i < nLeads; i++) {
          const item = langItems[i];
          finalAssignedLeads[item.index] = {
            ...item.rawLead,
            assigned_tl: item.selectedTl._id,
            assigned_hr: null,
          };
        }
      }
    }
  }

  return finalAssignedLeads;
};

module.exports = {
  assignLeads,
};

