# Enterprise backend migration manifest

Applied to Supabase project sbqpkfdcznulwpxlxiwu:

- enterprise_commerce_core
- enterprise_domain_records
- enterprise_media_moderation_notifications
- enterprise_audit_log_v2
- enterprise_catalog_rls
- enterprise_domain_rls
- enterprise_media_bucket

The authoritative SQL currently exists in the Supabase migration history. This manifest records the applied enterprise phase while the GitHub API safety gate rejects the large SQL migration payloads.
- enterprise_authorization_hardening
- enterprise_foreign_key_indexes

- enterprise_order_stock_transaction
- enterprise_rls_policy_cleanup

- strict_business_authorization
- final_authorization_hardening_v2
- conversation_server_creation
- enable_realtime_messages_notifications
- enforce_mfa_in_data_api
- moderation_first_listing_workflow
- enforce_listing_moderation_lifecycle
- server_notifications_messages_moderation
- final_seller_orders_and_atomic_stock
- secure_moderation_reporting
- moderate_seller_products_before_publish
- tighten_seller_order_transitions
- close_internal_membership_write_paths