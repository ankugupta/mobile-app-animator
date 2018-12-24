/**
 * Page object as saved in DB
 */
export interface PageEntity {

    pageId: string;
    bookId: string;
    imageUrl: string;
    contentType: string;
    contentUrl: string
}