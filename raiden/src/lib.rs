#[macro_use]
extern crate serde_derive;

pub mod condition;
pub mod errors;
pub mod id_generator;
pub mod key_condition;
pub mod next_token;
pub mod ops;
pub mod types;
pub mod update_expression;
pub mod value_id;

pub use condition::*;
pub use errors::*;
pub use key_condition::*;
pub use next_token::*;
pub use ops::*;

pub use id_generator::*;
pub use raiden_derive::*;
pub use rusoto_credential::*;
pub use value_id::*;

#[cfg(feature = "default")]
pub use rusoto_dynamodb_default::*;

#[cfg(feature = "default")]
pub use rusoto_core_default::*;

#[cfg(feature = "rustls")]
pub use rusoto_dynamodb_rustls::*;

#[cfg(feature = "rustls")]
pub use rusoto_core_rustls::*;

pub type Placeholder = String;

pub use derive_builder::Builder;

#[derive(Debug, Clone, PartialEq)]
pub enum AttributeType {
    S,    // String
    SS,   // String Set
    N,    // Number
    NS,   // Number Set
    B,    // Binary
    BS,   // Binary Set
    BOOL, // Boolean
    NULL, // Null
    L,    // List
    M,    // Map
}

impl std::fmt::Display for AttributeType {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

pub type AttributeNames = std::collections::HashMap<String, String>;

pub type AttributeValues = std::collections::HashMap<String, AttributeValue>;

pub struct Attributes(AttributeValues);

pub trait IntoAttrName: Sized + Copy {
    fn into_attr_name(self) -> String;
}

pub trait ToAttrNames: Sized {
    fn to_attr_names(&self) -> AttributeNames;
}

pub trait IntoAttrValues: Sized {
    fn into_attr_values(self) -> AttributeValues;
}

pub trait ToAttrMaps: Sized {
    fn to_attr_maps(&self) -> (AttributeNames, AttributeValues);
}

pub trait IntoAttribute: Sized {
    fn into_attr(self: Self) -> AttributeValue;
}

pub trait FromAttribute: Sized {
    fn from_attr(value: AttributeValue) -> Result<Self, ()>;
}

impl IntoAttribute for String {
    fn into_attr(self: Self) -> AttributeValue {
        AttributeValue {
            s: Some(self),
            ..AttributeValue::default()
        }
    }
}

impl FromAttribute for String {
    fn from_attr(value: AttributeValue) -> Result<Self, ()> {
        value.s.ok_or((/* TODO: Add convert error handling */))
    }
}

impl IntoAttribute for &'_ str {
    fn into_attr(self: Self) -> AttributeValue {
        AttributeValue {
            s: Some(self.to_owned()),
            ..AttributeValue::default()
        }
    }
}

impl<'a> IntoAttribute for std::borrow::Cow<'a, str> {
    fn into_attr(self: Self) -> AttributeValue {
        AttributeValue {
            s: Some(match self {
                std::borrow::Cow::Owned(o) => o,
                std::borrow::Cow::Borrowed(b) => b.to_owned(),
            }),
            ..AttributeValue::default()
        }
    }
}

impl<'a> FromAttribute for std::borrow::Cow<'a, str> {
    fn from_attr(value: AttributeValue) -> Result<Self, ()> {
        value
            .s
            .map(std::borrow::Cow::Owned)
            .ok_or((/* TODO: Add convert error handling */))
    }
}

macro_rules! default_attr_for_num {
    ($to: ty) => {
        impl IntoAttribute for $to {
            fn into_attr(self: Self) -> AttributeValue {
                AttributeValue {
                    n: Some(format!("{}", self)),
                    ..AttributeValue::default()
                }
            }
        }
        impl FromAttribute for $to {
            fn from_attr(value: AttributeValue) -> Result<Self, ()> {
                value
                    .n
                    .map(|v| v.parse().unwrap())
                    .ok_or((/* TODO: Add convert error handling */))
            }
        }
    };
}

default_attr_for_num!(usize);
default_attr_for_num!(u64);
default_attr_for_num!(u32);
default_attr_for_num!(u16);
default_attr_for_num!(u8);

default_attr_for_num!(isize);
default_attr_for_num!(i64);
default_attr_for_num!(i32);
default_attr_for_num!(i16);
default_attr_for_num!(i8);

impl<T: IntoAttribute> IntoAttribute for Option<T> {
    fn into_attr(self: Self) -> AttributeValue {
        match self {
            Some(value) => value.into_attr(),
            _ => AttributeValue {
                null: Some(true),
                ..Default::default()
            },
        }
    }
}

impl<T: FromAttribute> FromAttribute for Option<T> {
    fn from_attr(value: AttributeValue) -> Result<Self, ()> {
        match value.null {
            Some(true) => Ok(None),
            _ => Ok(Some(FromAttribute::from_attr(value)?)),
        }
    }
}

impl IntoAttribute for bool {
    fn into_attr(self: Self) -> AttributeValue {
        AttributeValue {
            bool: Some(self),
            ..AttributeValue::default()
        }
    }
}

impl FromAttribute for bool {
    fn from_attr(value: AttributeValue) -> Result<Self, ()> {
        value.bool.ok_or((/* TODO: Add convert error handling */))
    }
}

// impl IntoAttribute for std::collections::HashSet<String> {
//     fn into_attr(mut self: Self) -> AttributeValue {
//         AttributeValue {
//             ss: Some(self.drain().collect()),
//             ..AttributeValue::default()
//         }
//     }
// }
//
// impl FromAttribute for std::collections::HashSet<String> {
//     fn from_attr(value: AttributeValue) -> Result<Self, ()> {
//         value
//             .ss
//             .ok_or((/* TODO: Add convert error handling */))
//             .map(|mut value| value.drain(..).collect())
//     }
// }

impl<A: IntoAttribute> IntoAttribute for Vec<A> {
    fn into_attr(mut self: Self) -> AttributeValue {
        AttributeValue {
            l: Some(self.drain(..).map(|s| s.into_attr()).collect()),
            ..AttributeValue::default()
        }
    }
}

impl<A: FromAttribute> FromAttribute for Vec<A> {
    fn from_attr(value: AttributeValue) -> Result<Self, ()> {
        value
            .l
            .ok_or((/* TODO: Add convert error handling */))?
            .into_iter()
            .map(A::from_attr)
            .collect()
    }
}

impl<A: IntoAttribute + std::hash::Hash> IntoAttribute for std::collections::HashSet<A> {
    fn into_attr(mut self: Self) -> AttributeValue {
        AttributeValue {
            l: Some(self.into_iter().map(|s| s.into_attr()).collect()),
            ..AttributeValue::default()
        }
    }
}

impl<A: FromAttribute + std::hash::Hash + std::cmp::Eq> FromAttribute for std::collections::HashSet<A> {
    fn from_attr(value: AttributeValue) -> Result<Self, ()> {
        value
            .l
            .ok_or((/* TODO: Add convert error handling */))?
            .into_iter()
            .map(A::from_attr)
            .collect()
    }
}

pub struct GetItemController<'a> {
    pub client: &'a DynamoDbClient,
    pub item: GetItemInput,
}

pub fn merge_map<T>(
    map1: std::collections::HashMap<String, T>,
    map2: std::collections::HashMap<String, T>,
) -> std::collections::HashMap<String, T> {
    map1.into_iter().chain(map2).collect()
}
