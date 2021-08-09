declare namespace Paths {
    namespace Namespace$Namespace$Key {
        namespace Get {
            namespace Parameters {
                export type Key = string;
                export type Namespace = string;
            }
            export interface PathParameters {
                namespace: Parameters.Namespace;
                key: Parameters.Key;
            }
            namespace Responses {
                export interface $200 {
                }
            }
        }
        namespace Post {
            namespace Parameters {
                export type Key = string;
                export type Namespace = string;
            }
            export interface PathParameters {
                namespace: Parameters.Namespace;
                key: Parameters.Key;
            }
            export type RequestBody = string;
            namespace Responses {
                /**
                 * example:
                 * 666
                 */
                export type $201 = number;
            }
        }
    }
    namespace Namespacekeys$Namespace {
        namespace Get {
            namespace Parameters {
                export type Namespace = string;
            }
            export interface PathParameters {
                namespace: Parameters.Namespace;
            }
            namespace Responses {
                export interface $200 {
                }
            }
        }
    }
    namespace Namespaceseq$Namespace {
        namespace Get {
            namespace Parameters {
                export type Namespace = string;
            }
            export interface PathParameters {
                namespace: Parameters.Namespace;
            }
            namespace Responses {
                export interface $200 {
                }
            }
        }
    }
    namespace Namespacesize$Namespace {
        namespace Get {
            namespace Parameters {
                export type Namespace = string;
            }
            export interface PathParameters {
                namespace: Parameters.Namespace;
            }
            namespace Responses {
                export interface $200 {
                }
            }
        }
    }
}

