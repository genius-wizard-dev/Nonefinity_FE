import { ENDPOINTS } from "@/consts/endpoint";
import { httpClient } from "@/lib/axios";
import type {
  GooglePDF,
  GoogleSheet,
  ListPDFsResponse,
  ListSheetsResponse,
} from "./types";

export class DriveService {
  /**
   * List Google Sheets with pagination support
   */
  static async listSheets(
    token: string,
    pageToken?: string,
    pageSize: number = 50
  ): Promise<ListSheetsResponse> {
    try {
      const params: Record<string, unknown> = {
        page_size: pageSize,
      };
      if (pageToken) {
        params.page_token = pageToken;
      }

      const response = await httpClient.get<ListSheetsResponse>(
        ENDPOINTS.GOOGLE.LIST_SHEETS,
        params,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch sheets:", response.message);
        return {
          files: [],
          next_page_token: null,
          has_more: false,
        };
      }

      const data = response.getData();
      return {
        files: data.files || [],
        next_page_token: data.next_page_token || null,
        has_more: data.has_more || false,
      };
    } catch (error) {
      console.error("Failed to fetch sheets:", error);
      return {
        files: [],
        next_page_token: null,
        has_more: false,
      };
    }
  }

  /**
   * Search Google Sheets by keyword
   */
  static async searchSheets(
    keyword: string,
    token: string
  ): Promise<GoogleSheet[]> {
    try {
      const response = await httpClient.get<GoogleSheet[]>(
        ENDPOINTS.GOOGLE.SEARCH_SHEETS,
        { keyword },
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to search sheets:", response.message);
        return [];
      }

      const data = response.getData();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to search sheets:", error);
      return [];
    }
  }
}

export class PDFService {
  /**
   * List PDF files with pagination support
   */
  static async listPDFs(
    token: string,
    pageToken?: string,
    pageSize: number = 50
  ): Promise<ListPDFsResponse> {
    try {
      const params: Record<string, unknown> = {
        page_size: pageSize,
      };
      if (pageToken) {
        params.page_token = pageToken;
      }

      const response = await httpClient.get<ListPDFsResponse>(
        ENDPOINTS.GOOGLE.LIST_PDFS,
        params,
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to fetch PDFs:", response.message);
        return {
          files: [],
          next_page_token: null,
          has_more: false,
        };
      }

      const data = response.getData();
      return {
        files: data.files || [],
        next_page_token: data.next_page_token || null,
        has_more: data.has_more || false,
      };
    } catch (error) {
      console.error("Failed to fetch PDFs:", error);
      return {
        files: [],
        next_page_token: null,
        has_more: false,
      };
    }
  }

  /**
   * Search PDF files by keyword
   */
  static async searchPDFs(
    keyword: string,
    token: string
  ): Promise<GooglePDF[]> {
    try {
      const response = await httpClient.get<GooglePDF[]>(
        ENDPOINTS.GOOGLE.SEARCH_PDFS,
        { keyword },
        token
      );

      if (!response.isSuccess) {
        console.error("Failed to search PDFs:", response.message);
        return [];
      }

      const data = response.getData();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to search PDFs:", error);
      return [];
    }
  }
}

