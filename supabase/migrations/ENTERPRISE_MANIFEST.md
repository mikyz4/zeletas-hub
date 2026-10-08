# Supabase production migration manifest

Project: sbqpkfdcznulwpxlxiwu

The following migration names are currently applied in production, in order:

- 20261008124210 — initial_app_schema
- 20261008124220 — harden_conversation_authorization
- 20261008124518 — allow_conversation_creator_to_add_members
- 20261008124638 — tighten_api_exposure_and_fk_indexes
- 20261008124806 — fix_recursive_conversation_rls
- 20261008141424 — enterprise_commerce_core
- 20261008141438 — enterprise_domain_records
- 20261008141442 — enterprise_media_moderation_notifications
- 20261008141451 — enterprise_audit_log_v2
- 20261008141515 — enterprise_public_catalog_rls
- 20261008141524 — enterprise_domain_rls
- 20261008141544 — enterprise_media_bucket
- 20261008142455 — enterprise_authorization_hardening
- 20261008142500 — enterprise_foreign_key_indexes
- 20261008142641 — enterprise_order_stock_transaction
- 20261008142732 — enterprise_rls_policy_cleanup
- 20261008144011 — strict_business_authorization
- 20261008144109 — final_authorization_hardening_v2
- 20261008144501 — conversation_server_creation
- 20261008144739 — enable_realtime_messages_notifications
- 20261008145012 — enforce_mfa_in_data_api
- 20261008145228 — moderation_first_listing_workflow
- 20261008145252 — enforce_listing_moderation_lifecycle
- 20261008145445 — server_notifications_messages_moderation
- 20261008145604 — final_seller_orders_and_atomic_stock
- 20261008150041 — secure_moderation_reporting
- 20261008150242 — moderate_seller_products_before_publish
- 20261008150757 — tighten_seller_order_transitions
- 20261008151144 — close_internal_membership_write_paths
- 20261008151257 — optimize_mfa_rls_initplans
- 20261008151835 — enterprise_column_privilege_hardening
- 20261008151933 — enterprise_moderation_report_hardening
- 20261008151950 — enterprise_stock_rollback_fix
- 20261008152347 — revoke_trigger_function_execute
- 20261008152924 — enterprise_column_data_minimization
- 20261008153229 — enterprise_refund_state_and_privacy_hardening
- 20261008153553 — enterprise_paid_order_transaction
- 20261008154003 — account_deletion_financial_anonymization
- 20261008155037 — enterprise_atomic_paid_order
- 20261008155049 — enterprise_store_authorization
- 20261008155102 — enterprise_full_management_permissions
- 20261008155227 — enterprise_atomic_checkout_reservations
- 20261008155649 — enterprise_rls_consolidate_orders_and_images
- 20261008155714 — strict_revoke_commerce_function_execute
- 20261008155741 — remove_unused_process_paid_order
- 20261008160250 — enterprise_confirm_payment_transition_only
- 20261008160723 — critical_fix_product_store_membership_rls
- 20261008160800 — finalize_order_visibility_and_image_policies
- 20261008161046 — strict_seller_order_transition
- 20261008161439 — media_upload_rate_limit_guard
- 20261008161644 — make_media_bucket_private

## Traceability note
The database migration history is the authoritative runtime state. This repository records the migration inventory, but the connector available in this environment does not expose the historical SQL bodies for every applied migration. Therefore this file is not claimed to be a byte-for-byte SQL mirror. Future schema changes should add their SQL migration file to GitHub and apply the same migration to Supabase.
