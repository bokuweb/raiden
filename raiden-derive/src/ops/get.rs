use quote::*;

pub(crate) fn expand_get_item(
    partition_key: &proc_macro2::Ident,
    sort_key: &Option<proc_macro2::Ident>,
    struct_name: &proc_macro2::Ident,
    fields: &syn::FieldsNamed,
    rename_all_type: crate::rename::RenameAllType,
) -> proc_macro2::TokenStream {
    let trait_name = format_ident!("{}GetItem", struct_name);
    let client_name = format_ident!("{}Client", struct_name);
    let builder_name = format_ident!("{}GetItemBuilder", struct_name);
    let from_item = super::expand_attr_to_item(&format_ident!("res_item"), fields, rename_all_type);

    let client_trait = if let Some(sort_key) = sort_key {
        quote! {
            pub trait #trait_name {
                fn get<PK, SK>(&self, key: (PK, SK)) -> #builder_name
                    where PK: ::raiden::IntoAttribute + std::marker::Send,
                          SK: ::raiden::IntoAttribute + std::marker::Send;
            }

            impl #trait_name for #client_name {
                fn get<PK, SK>(&self, key: (PK, SK)) -> #builder_name
                    where PK: ::raiden::IntoAttribute + std::marker::Send,
                          SK: ::raiden::IntoAttribute + std::marker::Send
                {
                    let mut input = ::raiden::GetItemInput::default();
                    let pk_attr: AttributeValue = key.0.into_attr();
                    let sk_attr: AttributeValue = key.1.into_attr();
                    let mut key_set: std::collections::HashMap<String, AttributeValue> = std::collections::HashMap::new();
                    key_set.insert(stringify!(#partition_key).to_owned(), pk_attr);
                    key_set.insert(stringify!(#sort_key).to_owned(), sk_attr);
                    input.key = key_set;
                    input.table_name = self.table_name();
                    #builder_name {
                        client: &self.client,
                        input,
                    }
                }
            }
        }
    } else {
        quote! {
            pub trait #trait_name {
                fn get<K>(&self, key: K) -> #builder_name
                    where K: ::raiden::IntoAttribute + std::marker::Send;
            }

            impl #trait_name for #client_name {
                fn get<K>(&self, key: K) -> #builder_name
                    where K: ::raiden::IntoAttribute + std::marker::Send
                {
                    let mut input = ::raiden::GetItemInput::default();
                    let key_attr: AttributeValue = key.into_attr();
                    let mut key_set: std::collections::HashMap<String, AttributeValue> = std::collections::HashMap::new();
                    key_set.insert(stringify!(#partition_key).to_owned(), key_attr);
                    input.key = key_set;
                    input.table_name = self.table_name();
                    #builder_name {
                        client: &self.client,
                        input,
                    }
                }
            }
        }
    };

    quote! {
        #client_trait

        pub struct #builder_name<'a> {
            pub client: &'a ::raiden::DynamoDbClient,
            pub input: ::raiden::GetItemInput,
        }

        impl<'a> #builder_name<'a> {
            fn consistent(mut self) -> Self {
                self.input.consistent_read = Some(true);
                self
            }

            async fn run(self) -> Result<::raiden::get::GetOutput<#struct_name>, ::raiden::RaidenError> {
                 let res = self.client.get_item(self.input).await?;
                 if res.item.is_none() {
                     return Err(::raiden::RaidenError::ResourceNotFound("resource not found".to_owned()));
                 };
                 let res_item = &res.item.unwrap();
                 let item = #struct_name {
                    #(#from_item)*
                 };
                 Ok(::raiden::get::GetOutput {
                     item,
                     consumed_capacity: res.consumed_capacity,
                 })
            }
        }
    }
}

/*
https://github.com/rusoto/rusoto/blob/master/rusoto/services/dynamodb/src/generated.rs#L1137
#[cfg_attr(feature = "deserialize_structs", derive(Deserialize))]
pub struct GetItemInput {
    pub attributes_to_get: Option<Vec<String>>,
    pub consistent_read: Option<bool>,
    pub expression_attribute_names: Option<::std::collections::HashMap<String, String>>,
    pub key: ::std::collections::HashMap<String, AttributeValue>,
    pub projection_expression: Option<String>,
    pub return_consumed_capacity: Option<String>,
    pub table_name: String,
}
*/
