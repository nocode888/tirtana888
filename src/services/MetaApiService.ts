class MetaApiService {
  private transformApiResponse(item: any, filters: any) {
    return {
      id: item.id || '',
      title: item.title || '',
      description: item.description || '',
      // Tambahkan properti lain yang diperlukan sesuai dengan data API Anda
    };
  }

  async search(filters: any) {
    try {
      const data = await // ... existing code ...
      return data.data.map((item: any) => this.transformApiResponse(item, filters));
    } catch (error) {
      console.error('Meta API search error:', error);
      throw error;
    }
  }
} 