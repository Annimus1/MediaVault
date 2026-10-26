import { Media } from "../types.js";

/**
 * Interface representing a provider that can generate media recommendations.
 *
 * @interface IProvider
 */
export interface IProvider{
    recommendation(media: Media[] | null): Promise<string | null>
}