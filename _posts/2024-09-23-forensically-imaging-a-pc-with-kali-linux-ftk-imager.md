PS:
- This blog post was originally created on Sep 8, 2021 and has recently been migrated to this platform.
- I made a few changes to the original article since Exterro acquired AccessData in 2020 (https://www.exterro.com/about/news/exterro-acquires-accessdata-to-form-the-leading-enterprise-legal-grc-software-platform-across-data-privacy-forensics-and-e-discovery).

# Introduction

You are supposed to obtain a forensic image of a PC; however, you lack the “sophisticated” tools to do so because they’re costly — a write-blocker (https://digitalintelligence.com/store/products/w2710), the right screwdriver kit (https://www.amazon.com/Professional-Precision-Screwdriver-Magnetic-Flexible/dp/B07Q45V69K), etc. What do you do? 🤔

Don’t stress! You could make use of open-source tools to achieve your goal. In this tutorial, we shall explore the use of Exterro’s FTK Imager (https://www.exterro.com/digital-forensics-software/ftk-imager) running on Kali Live.

NB: I have assumed that you have some basics in Linux.

Here are my reasons for using the two:
1. Kali Live has ‘Forensics Mode’ — its benefits:
  * Kali Live is non-destructive; it makes no changes on the disk.
  * ‘Forensics Mode’ disallows auto-mounting of drives.
2. FTK Imager is easy to use.

Let’s dive right in.

# Step 0: Create the Disk

You can download Kali Live from here (https://www.kali.org/get-kali/#kali-live). Once you download it, you can use Rufus (https://rufus.ie/en/) to create the Kali Live disk you will boot from. Apply the settings shown below:
* Device: This is the drive that you will use to create the live disk. (I recommend that you use a flash drive.)
* Boot selection: Use the Kali Live image you downloaded.
* Partition scheme: MBR or GPT.
You may leave the rest of the options as they are.

After clicking on ‘Start’ at the bottom of this window, in case you are prompted to choose between iso and dd (on the next window), choose dd. Choosing iso may cause your antivirus software to detect and block some of the malicious (but helpful) modules native in Kali Linux, and thus corrupting the disk.

dd will however alter the format of your drive. To restore the normal format (FAT32 or NTFS), refer to this article (https://medium.com/@fnjoroge/how-to-reformat-a-disk-created-using-dd-format-f444d3a02f22).


Figure 1: Configurations to apply once you launch Rufus

# Step 1: Change BIOS Settings

This step is important as some PCs won’t allow you to boot from the live disk.

The BIOS menu varies with the device. For instance, to access it on most HP PCs, press F10 as soon as you turn on your machine; for most Lenovo PCs, press F2. You may confirm what works for you with a Google search.

These are the settings to look out for:
1. Secure Boot: Disable it.
2. UEFI/Legacy Boot: If possible, have both options on. This is pegged on your preference though. For UEFI, ensure CSM Support is on to allow booting from a disk with an MBR partition scheme; else, use GPT (instead of MBR) while creating your disk. Legacy Boot supports the MBR partition scheme.

After altering the settings, save changes and exit. Remember to restore the original settings after you complete the imaging process.

NB: BIOS settings are stored on the flash memory, therefore changing BIOS settings will not tamper with the evidence.

# Step 2: Boot Up

The next step is booting from the disk. To do so, you need to confirm the specific function key used to access the boot menu. As soon as you turn on the device, press the function key to access the boot menu (HP: F9, Lenovo: F12).


Figure 2: Example of boot menu
After selecting the disk to boot from, you should see this window. Click on ‘Live (forensic mode)’:


Figure 3: Kali Live boot menu
After the boot-up process is complete, you will now access the desktop.


Figure 4: Kali Live desktop

# Step 3: Imaging Process

(Optional) First things first, make yourself root to avoid forgetting sudo as you type in your commands.
```bash
sudo su
```
FTK Imager is not a native tool in the Kali suite, therefore we need to download it. Connect your PC to the Internet by clicking the taskbar icon next to the clock (on the top right corner of the Kali Live desktop). To confirm that your PC is connected, open the terminal (by clicking the fourth icon on the top left corner) and run the command:
```
ping -c 5 google.com
```
You should get a result that looks like this: `Reply from 172.217.170.174: bytes=32 time=12ms TTL=57` .

This is the link (https://web.archive.org/web/20160909140256/https://ad-zip.s3.amazonaws.com/ftkimager.3.1.1_ubuntu64.tar.gz) to download FTK Imager, CLI (command-line interface) version
```bash
wget https://web.archive.com/20160909140256/https://ad-zip.s3.amazonaws.com/ftkimager.3.1.1_ubuntu64.tar.gz
```

Figure 6: Download of FTK Imager CLI version (with updated URL)

Extract the contents of the compressed file using the command `tar -zxvf [compressed_file]` .


Figure 6: Extraction

Next, connect your destination drive to the PC. This is where you will store your forensic image. On the Kali Live desktop, open the terminal (the fourth icon on the top left corner). Use the `fdisk -l` command to return a list of available disks.


Figure 7: List of disks

Figure 8: List of disks (cont.)

It is important to note two disks: the PC disk and the external hard drive connected. The PC disk will serve as the source and the external disk as the destination. In my case, the PC disk is `/dev/nvme0n1` and the external disk `/dev/sda`.

The destination drive is unusable as is, i.e., `/dev/sda` is not writeable. We need to mount it to a local directory. First, create a directory using the command `mkdir [directory_path]` , e.g., `mkdir /mnt/destDrive` . Then mount your disk to the directory you’ve created using the command mount. In my case, `mount /dev/sda1 /mnt/destDrive`. We have used `/dev/sda1` instead of `/dev/sda` since we’d only be interested in a partition within the disk.

Next, we run FTK Imager to image the PC disk. The syntax is as follows:
```bash
./ftkimager [source] [destination] [options]
```
There are several options you can use for your imaging. To check them out, run the command `./ftkimager` with no parameters.
For instance, to create an Encase image with ‘best’ compression, here’s the command:
```bash
./ftkimager /dev/nvme0n1 /mnt/destDrive/jdoePC --e01 --compress 9 --case-number "CO-X-FOR-HDD-001" --evidence-number "HDD-001" --description "John Doe's PC" --examiner "F. Rodriguez" --verify
```
As you may have noticed, we specified a directory on the destination. `--case-number` , `--evidence-number` , `--description` and `--examiner` are metadata that should be specified for reporting purposes. `--verify` is important for integrity purposes, i.e., that there are no changes between the disk and the image.

NB: Remember not to interchange the source and destination, or else you will corrupt the evidence.


Figure 9: Image creation

Figure 10: Image verification

Figure 11: Hash matching to prove no loss of integrity

There you go, you have your image. A few more steps, and you’ll be completely done. You need to safely unmount the destination drive. To do so, use the command `umount [mount_directory]`. You can now shut down the PC using `init 0`. Remember to change the BIOS settings back to what they were.

To check if the image is not corrupted, you may use FTK Imager GUI (graphical user interface) version. On a Windows PC with FTK Imager installed, connect the external hard drive and add the image as an evidence item. Use the tree on the left side of the window to navigate through the contents of the image. In case you get the error ‘Unrecognized file system [Data]’ on the data partition, you may have to repeat the process using a different method. I recommend doing a disk copy using Hirens Boot CD.

# Conclusion

We have gone through the process of imaging a disk using FTK Imager and Kali Live. Remember, the goal is to preserve the integrity of the evidence.

You can also use Parrot OS in place of Kali Live.

I hope you enjoyed this article!
