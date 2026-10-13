import 'server-only';
import { rules } from '@/lib/config/rules';
import { siteConfig } from '@/lib/config/site';
import { toolsConfig } from '@/lib/config/tools';
import { publicProductConfigSchema, type PublicProductConfig } from '../schemas';

export function buildProductConfigFixture(): PublicProductConfig {
  return publicProductConfigSchema.parse({
    rulesVersion: rules.rulesVersion,
    dataSource: 'fixture',
    brandName: siteConfig.brandName,
    uploadLimits: {
      maxFileBytes: toolsConfig.upload.maxFileBytes,
      maxDataRows: toolsConfig.upload.maxDataRows,
      extensions: toolsConfig.upload.extensions,
    },
    features: { previewClaim: siteConfig.previewClaimSupported },
  });
}
