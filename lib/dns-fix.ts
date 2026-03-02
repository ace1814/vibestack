/**
 * dns-fix.ts
 *
 * Forces Node.js DNS to use reliable public resolvers (Cloudflare + Google)
 * instead of the system default. This fixes "TypeError: fetch failed" when
 * the local router DNS (e.g. 192.168.1.1) cannot resolve cloud hostnames
 * like *.supabase.co.
 *
 * Import this at the top of any server-side file that makes outbound fetches.
 */
import dns from 'dns';

// Use Cloudflare (1.1.1.1) and Google (8.8.8.8) as DNS resolvers
dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1']);
