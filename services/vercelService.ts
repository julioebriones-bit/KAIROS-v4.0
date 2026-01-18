
/**
 * VERCEL_INTEGRATION_SERVICE (v1.0)
 * Comunicación directa con Vercel API para monitoreo de infraestructura KAIROS.
 */

export const vercelService = {
  // Token proporcionado por el usuario para comunicación directa
  VERCEL_TOKEN: 'vck_1K5ne1rk9cxKZLNU9DDbVXFsTWEACUKt2jmdMkuoaFa05V7SUr38u2Y4',
  BASE_URL: 'https://api.vercel.com',

  /**
   * Obtiene los últimos despliegues del proyecto para verificar integridad.
   */
  async fetchLatestDeployments() {
    try {
      const response = await fetch(`${this.BASE_URL}/v6/deployments?limit=5`, {
        headers: {
          'Authorization': `Bearer ${this.VERCEL_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Vercel API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.deployments || [];
    } catch (error) {
      console.error('VercelService Error:', error);
      return [];
    }
  },

  /**
   * Verifica el estado de salud global basado en el estado del último despliegue de producción.
   */
  async getProductionStatus(): Promise<'operational' | 'degraded' | 'critical'> {
    try {
      const deployments = await this.fetchLatestDeployments();
      if (deployments.length === 0) return 'operational';

      const latest = deployments[0];
      
      // Mapeo de estados de Vercel a KAIROS Health
      switch (latest.state) {
        case 'READY':
          return 'operational';
        case 'BUILDING':
        case 'INITIALIZING':
          return 'degraded';
        case 'ERROR':
        case 'CANCELED':
          return 'critical';
        default:
          return 'operational';
      }
    } catch (e) {
      return 'degraded';
    }
  }
};
