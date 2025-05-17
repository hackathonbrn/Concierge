export async function addIpToIptables(ip: string) {
  // TODO: use real access control system
  console.log(`Adding IP ${ip} to access list`);
  // await Bun.spawn(["iptables", "-A", "INPUT", "-s", ip, "-j", "ACCEPT"]);
}
