# TPM (Trusted Platform Module)

## 1. Overview

### A. Definition
> A **hardware-based security chip (security coprocessor)** that generates and stores cryptographic keys, measures the integrity of platform components, and performs sealing and remote attestation; it is the Root of Trust device standardized by the TCG (Trusted Computing Group). Today, TPM 2.0 is the de facto standard.

The core idea of TPM is to "**place the root of security in hardware, not software**." Software security such as the operating system or antivirus is ultimately code that itself runs in memory, so if the kernel is compromised or the early boot stages are tampered with, it is neutralized along with them. In other words, a circular problem remains: "what guarantees the integrity of the code that is guarding security?" TPM isolates private keys and measurement values in a separate tamper-resistant chip so that the root of trust is preserved even if the upper software layers are infected.

### B. Background and Necessity
If disk encryption keys or certificates are kept in ordinary memory or on disk, they leak through memory dumps or file theft. Moreover, bootkits and rootkits that secretly swap out the bootloader or kernel establish themselves before the OS starts and are hard to detect. TPM solves both problems at once by allowing **keys to be used without ever exposing them in plaintext outside the chip**, and by **physically accumulating the hash of each boot stage** so that tampering can be proven after the fact. Windows 11 making TPM 2.0 a mandatory requirement also reflects the trend of raising the hardware trust foundation all the way down to the personal PC level.

## 2. Key Functions

```mermaid
flowchart LR
  K[Key generation/storage] --- M[Integrity measurement<br/>PCR]
  M --- S[Sealing]
  S --- A[Remote verification<br/>Attestation]
```

TPM's functions are not separate parts but a single chain of trust flowing "**measure → seal → attest**." Below we describe why each function is needed and how they interlock.

**A. Key generation and storage** — TPM creates keys with its internal random number generator and uses private keys only for signing and decryption **without exporting them outside the chip in plaintext**. The top-level root key (SRK, etc.) never leaves the chip, and subordinate keys are encrypted (wrapped) with this root key and stored on disk, so even if the file leaks it cannot be used without that chip. This is the fundamental difference from a software keystore.

**B. Integrity measurement (PCR)** — During boot, in the order firmware → bootloader → kernel, each stage computes the hash of the next stage's code before executing it and records it in a **PCR (Platform Configuration Register)**. The PCR is not overwritten but accumulated (extended) in the form `new = Hash(old ‖ measurement)`, so if anything is tampered with even once along the way, the final PCR value becomes completely different. In short, it compresses the boot history into an unforgeable fingerprint.

**C. Sealing** — Data is encrypted with the condition that it "**can only be decrypted in a specific PCR state**." For example, if a disk encryption key is sealed to "the PCR values of a normal boot," then when an attacker boots with a replaced bootloader, the PCRs differ and the key is not released. It is the mechanism that connects measurement results to actual access control.

**D. Remote verification (Attestation)** — When the TPM signs the PCR values with its own key (Quote) and submits them to a remote server, the server can judge remotely whether the device booted into a trustworthy state. It is the key means of answering "can this device be trusted?" in Zero Trust on a hardware basis. In addition, it provides **random number generation (RNG)** based on hardware entropy.

| Function | Description | Problem Solved |
|---|---|---|
| Key generation/storage | Isolates private keys inside the chip, never exposed in plaintext | Key theft/leakage |
| Integrity measurement (PCR) | Cumulatively records hashes of boot components | Bootkits/concealed tampering |
| Sealing | Decryption only in a specific platform state | Data access from a manipulated environment |
| Remote verification (Attestation) | Remote proof of state via signed PCR values | Remote trust decisions |
| Random number generation (RNG) | Hardware entropy | Predictable keys |

## 3. Applications

TPM implements real security scenarios by combining the functions above. **Secure boot** uses measurement and sealing to establish a Chain of Trust and prevents a normal boot with tampered boot components. Windows BitLocker, the representative case of **disk encryption**, seals the volume key in the TPM so that automatic decryption is blocked if the disk is moved to another PC or the boot environment changes. In **device authentication**, keys embedded in the chip prove a device's unique identity, making credential theft difficult, and serve as the device trust foundation for enterprise MDM and Zero Trust.

| Area | Application | Functions Used |
|---|---|---|
| Secure boot | Measured/Secure Boot chain of trust | Measurement, sealing |
| Disk encryption | BitLocker volume key protection | Sealing |
| Device authentication | Protection of device identity/credentials | Key storage, verification |
| Platform integrity | Windows 11 requirement, DRM | Measurement, remote attestation |

## 4. Related Concept Comparison — TPM vs HSM

Both are hardware-based key protection devices, but **their purpose and scale differ**. TPM is an **embedded chip** that guarantees the "platform trust and integrity" of a single device at low cost, whereas an HSM (Hardware Security Module) is a **dedicated appliance** that manages and signs large volumes of keys with high performance in the data center. That is, TPM focuses on "can this PC be trusted?", while HSM focuses on "are the bank's signing keys operated safely at scale?"

| Category | TPM | HSM |
|---|---|---|
| Form | Chip embedded in PC/server | Dedicated appliance |
| Focus | Platform trust/integrity (single device) | Large-scale key management/signing |
| Performance/cost | Low performance, low cost, ubiquitous | High performance, high cost |

## 5. Considerations and Implications
- **Physical anchor of Zero Trust**: It provides the verification basis for "trust but verify" in hardware, replacing device trust based on software declarations with measurement and proof.
- **Key backup and recovery policy is essential**: Chip-bound keys are strong, but data can be permanently locked when the motherboard is replaced or the chip fails, so a system for storing recovery keys (e.g., BitLocker recovery keys) is absolutely necessary.
- **Recognizing limitations**: It can still be exposed to firmware vulnerabilities (e.g., logic/implementation flaws) or sophisticated physical attacks (measurement bus sniffing), so TPM should be treated not as a silver bullet but as one layer of defense in depth.
- **Direction of expansion**: The role of the root of trust is broadening into Confidential Computing, remote-attestation-based software supply chain security, and more.

---

> **In one line**: TPM is a hardware security chip that performs *key storage, integrity measurement (PCR), sealing, and remote attestation*; through the "measure → seal → attest" chain of trust it provides the **Root of Trust** for secure boot, disk encryption, and device authentication, and becomes the physical anchor of Zero Trust.
