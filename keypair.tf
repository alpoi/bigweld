resource "tls_private_key" "key" {
  algorithm = "RSA"
}

resource "aws_key_pair" "keypair" {
  key_name   = "bigweld-keypair"
  public_key = tls_private_key.key.public_key_openssh
}

output "private_key_pem" {
  value     = tls_private_key.key.private_key_pem
  sensitive = true
}