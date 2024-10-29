[![MATTR](../docs/assets/mattr-logo-square.svg)](https://github.com/mattrglobal)

# Manual revocation check

## Overview

Credential revocation is a critical feature that allows issuers to invalidate previously issued credentials, ensuring the integrity and security of the system.

MATTR provides capabilities to issue revokable credentials, to manage the revocation status of credentials, and to check the revocation status of a credential. Check out our [Credential management](https://learn.mattr.global/docs/capabilities/management) capabilities and our [Revocation tutorial](https://learn.mattr.global/tutorials/management/revocation) to learn more.

While we highly recommend to leverage your MATTR tenant for credential management, credentials also enable unauthenticated relying parties to check their revocation status to enable interoperability.

This sample script demonstrates how to retrieve the revocation list data, how to decode the data, and how to check the revocation status.

## How to run the script

### JSON credentials

JSON credentials contain a `credentialStatus` field that holds the reference to a revocation list.

```json
    "credentialStatus": {
        "id": "https://labs-mattr-university.vii.au01.mattr.global/core/v2/credentials/web-semantic/revocation-lists/57698edc-0826-4628-a2eb-888cb840d4b5#0",
        "type": "RevocationList2020Status",
        "revocationListIndex": "0",
        "revocationListCredential": "https://labs-mattr-university.vii.au01.mattr.global/core/v2/credentials/web-semantic/revocation-lists/57698edc-0826-4628-a2eb-888cb840d4b5"
    },
```

You can check the revocation status of this credential by running the script with node, providing the `revocationListCredential` and `revocationListIndex` as arguments.


```bash
node manual-revocation-check.js https://learn.vii.au01.mattr.global/core/v2/credentials/web-semantic/revocation-lists/0ec79c8e-9859-46c0-a277-6e48f468b16e 1
```

### CWT and Semantic CWT credentials

CWT and Semantic CWT credentials are usually shared and verified in their encoded forms. For convenience, you can provide the encoded credential or the revocation list URL and index to the script.

If you provide the encoded form, the script will decode the credential and retrieve the list URL and index.

```bash
node manual-revocation-check.js CSC:/1/2KCE3IQEJB5DCMSLNFYUYUQBE2QFSAIJU4AXQJLENFSDU53FMI5G2YLUORZC25LONF3GK4TTNF2HSLTNMF2HI4TMMFRHGLTDN4DBUZZBHGDAIGTLJHJAAZDOMFWWK22FNVWWCICUMFZW2YLONBQWY5LNNZUU6ZTVJVAVIVCSEBGGCYTTEBKW42LWMVZHG2LUPE5AAAIAACRAEAADPCCWQ5DUOBZTULZPNRQWE4ZNNVQXI5DSFV2W42LWMVZHG2LUPEXHM2LJFZQXKMBRFZWWC5DUOIXGO3DPMJQWYL3DN5ZGKL3WGIXWG4TFMRSW45DJMFWHGL3DN5WXAYLDOQXXEZLWN5RWC5DJN5XC23DJON2HGLZXGM3WGMBWHBTC2NDFMM2C2NBTMY4C2YTDHA4S2NRZMUZDMMJUMEZWKZDGA7MEAUBXE2MBKC2XJAKLSCN2AVW6OJMQLBAJQWGFUIV55FG2U7NK6B4DRSTNOKHVLRBEON47KCHLKZ42FAOMHCA24SHRWIOAAVCKTNQQAE7J2INROWI4DS3ZK3JEXVQGGZ4UGAJFFI
```

If you decode the credential yourself, you can pass the revocation list URL and index.

```bash
node manual-revocation-check.js https://learn.vii.au01.mattr.global/core/v2/credentials/compact/revocation-lists/0ec79c8e-9859-46c0-a277-6e48f468b16e 1
```

## Results

The results are displayed in your terminal, showing the inferred credential type and the revocation status.

```
[Credential Type]    CWT
[Revocation status]  Revoked
```

---

<p align="center"><a href="https://mattr.global" target="_blank"><img height="40px" src ="../docs/assets/mattr-logo-tm.svg"></a></p><p align="center">Copyright © MATTR Limited. <a href="../LICENSE">Some rights reserved.</a><br/>“MATTR” is a trademark of MATTR Limited, registered in New Zealand and other countries.</p>
